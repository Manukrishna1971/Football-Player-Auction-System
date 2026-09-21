const AuctionState = require('../models/AuctionState');
const Player = require('../models/Player');
const Team = require('../models/Team');
const Bid = require('../models/Bid');

let timerInterval = null;

function setupAuctionSocket(io) {
  // Helper to fetch populated auction state
  async function getPopulatedState() {
    let state = await AuctionState.findOne()
      .populate('currentPlayer')
      .populate('currentBidder');
    if (!state) {
      state = await AuctionState.create({
        status: 'idle',
        timerSeconds: 20,
        initialTimer: 20
      });
      state = await AuctionState.findById(state._id)
        .populate('currentPlayer')
        .populate('currentBidder');
    }
    return state;
  }

  // Broadcast current state to all connected sockets
  async function broadcastState(message = null) {
    const state = await getPopulatedState();
    if (message) {
      state.message = message;
      await state.save();
    }
    io.emit('auction:state_update', state);
    return state;
  }

  // Broadcast notification toast
  function broadcastNotification(title, message, type = 'info') {
    io.emit('auction:notification', {
      id: Date.now(),
      title,
      message,
      type, // 'bid', 'sold', 'unsold', 'info', 'warning'
      timestamp: new Date()
    });
  }

  // Timer Tick Engine
  function startCountdown() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(async () => {
      try {
        const state = await AuctionState.findOne();
        if (!state || !state.isTimerRunning) {
          clearInterval(timerInterval);
          timerInterval = null;
          return;
        }

        if (state.timerSeconds > 0) {
          state.timerSeconds -= 1;
          await state.save();
          io.emit('timer:tick', {
            seconds: state.timerSeconds,
            initialTimer: state.initialTimer
          });
        } else {
          // Timer reached 0!
          clearInterval(timerInterval);
          timerInterval = null;
          state.isTimerRunning = false;
          await state.save();

          // Check if there was a bidder
          if (state.currentBidder && state.currentPlayer) {
            await handleSell(state.currentPlayer, state.currentBidder, state.currentBid);
          } else if (state.currentPlayer) {
            await handleUnsold(state.currentPlayer);
          }
        }
      } catch (err) {
        console.error('Timer ticker error:', err);
      }
    }, 1000);
  }

  function stopCountdown() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  // Finalize Sale
  async function handleSell(playerId, teamId, amount) {
    try {
      stopCountdown();
      const player = await Player.findById(playerId);
      const team = await Team.findById(teamId);

      if (!player || !team) return;

      // Update Player
      player.status = 'sold';
      player.soldTo = team._id;
      player.currentPrice = amount;
      await player.save();

      // Update Team
      team.spent += amount;
      if (!team.players.includes(player._id)) {
        team.players.push(player._id);
      }
      await team.save();

      // Update Auction State
      const state = await AuctionState.findOne();
      state.status = 'sold';
      state.isTimerRunning = false;
      state.message = `🔨 GAVEL DOWN! ${player.name} SOLD to ${team.name} for $${(amount / 1000000).toFixed(1)}M!`;
      await state.save();

      const populatedState = await getPopulatedState();
      io.emit('auction:sold', {
        player,
        team,
        amount,
        message: state.message,
        state: populatedState
      });

      broadcastNotification(
        'PLAYER SOLD!',
        `${player.name} has been acquired by ${team.name} for $${(amount / 1000000).toFixed(1)}M`,
        'sold'
      );
    } catch (err) {
      console.error('Handle sell error:', err);
    }
  }

  // Handle Unsold Player
  async function handleUnsold(playerId) {
    try {
      stopCountdown();
      const player = await Player.findById(playerId);
      if (player) {
        player.status = 'unsold';
        await player.save();
      }

      const state = await AuctionState.findOne();
      state.status = 'unsold';
      state.isTimerRunning = false;
      state.message = `${player ? player.name : 'Player'} goes UNSOLD at base price $${(state.currentBid / 1000000).toFixed(1)}M`;
      await state.save();

      const populatedState = await getPopulatedState();
      io.emit('auction:unsold', {
        player,
        message: state.message,
        state: populatedState
      });

      broadcastNotification(
        'PLAYER UNSOLD',
        `${player ? player.name : 'Player'} did not receive any bids.`,
        'unsold'
      );
    } catch (err) {
      console.error('Handle unsold error:', err);
    }
  }

  // Socket Connection Listener
  io.on('connection', async (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Send initial state on connection
    const initialState = await getPopulatedState();
    socket.emit('auction:state_update', initialState);

    // 1. PLACE BID
    socket.on('bid:place', async (data) => {
      try {
        const { teamId, amount, userId } = data;
        const state = await AuctionState.findOne().populate('currentPlayer');

        if (!state || state.status !== 'bidding') {
          return socket.emit('bid:error', { message: 'Auction is not currently open for bids.' });
        }

        const player = await Player.findById(state.currentPlayer);
        if (!player) {
          return socket.emit('bid:error', { message: 'No active player in auction.' });
        }

        const team = await Team.findById(teamId);
        if (!team) {
          return socket.emit('bid:error', { message: 'Invalid team.' });
        }

        // Check if squad is full
        if (team.players.length >= team.maxPlayers) {
          return socket.emit('bid:error', {
            message: `Squad Limit Reached! ${team.name} already has ${team.maxPlayers} players.`
          });
        }

        // Check budget
        const remaining = team.budget - team.spent;
        if (amount > remaining) {
          return socket.emit('bid:error', {
            message: `Insufficient Funds! Remaining budget is $${(remaining / 1000000).toFixed(1)}M, bid is $${(amount / 1000000).toFixed(1)}M.`
          });
        }

        // Check bid amount is strictly higher
        const minRequired = state.currentBidder ? state.currentBid + 100000 : state.currentBid;
        if (amount < minRequired) {
          return socket.emit('bid:error', {
            message: `Bid must be at least $${(minRequired / 1000000).toFixed(2)}M.`
          });
        }

        // Prevent same team from outbidding themselves consecutively if desired, or allow it
        if (state.currentBidder && state.currentBidder.toString() === team._id.toString()) {
          return socket.emit('bid:error', {
            message: `${team.name} already holds the highest bid!`
          });
        }

        // Valid bid! Record in database
        const bid = await Bid.create({
          player: player._id,
          team: team._id,
          user: userId || null,
          amount
        });

        // Update auction state
        state.currentBid = amount;
        state.currentBidder = team._id;
        // Reset timer to 15s to allow counter-bids
        state.timerSeconds = Math.max(state.timerSeconds, 15);
        state.message = `⚡ New highest bid: $${(amount / 1000000).toFixed(1)}M by ${team.name}`;
        
        state.bidHistory.unshift({
          teamId: team._id,
          teamName: team.name,
          teamShort: team.shortName,
          teamColor: team.color,
          amount,
          timestamp: new Date()
        });

        // Keep bidHistory at max 20 entries
        if (state.bidHistory.length > 20) {
          state.bidHistory = state.bidHistory.slice(0, 20);
        }

        await state.save();

        const updatedState = await getPopulatedState();

        // Broadcast to everyone
        io.emit('bid:success', {
          bid,
          team: {
            id: team._id,
            name: team.name,
            shortName: team.shortName,
            color: team.color,
            logo: team.logo
          },
          amount,
          state: updatedState
        });

        broadcastNotification(
          'NEW BID PLACED!',
          `${team.name} bid $${(amount / 1000000).toFixed(1)}M for ${player.name}`,
          'bid'
        );
      } catch (err) {
        console.error('Bid error:', err);
        socket.emit('bid:error', { message: 'Internal server error processing bid.' });
      }
    });

    // 2. START AUCTION (Admin)
    socket.on('auction:start', async (data) => {
      try {
        let state = await AuctionState.findOne();
        let targetPlayerId = data?.playerId || state?.currentPlayer;

        let player;
        if (targetPlayerId) {
          player = await Player.findById(targetPlayerId);
        } else {
          player = await Player.findOne({ status: 'upcoming' }).sort({ orderIndex: 1 });
        }

        if (!player) {
          return socket.emit('auction:error', { message: 'No upcoming players available for auction.' });
        }

        player.status = 'in_auction';
        await player.save();

        state.currentPlayer = player._id;
        state.currentBid = player.basePrice;
        state.currentBidder = null;
        state.timerSeconds = 25;
        state.initialTimer = 25;
        state.isTimerRunning = true;
        state.status = 'bidding';
        state.bidHistory = [];
        state.message = `Bidding LIVE for ${player.name}! Base price: $${(player.basePrice / 1000000).toFixed(1)}M`;
        await state.save();

        startCountdown();
        await broadcastState();

        broadcastNotification(
          'AUCTION STARTED',
          `Bidding opened for ${player.name} (${player.position}, ${player.stats.overall} OVR)`,
          'info'
        );
      } catch (err) {
        console.error('Auction start error:', err);
      }
    });

    // 3. PAUSE AUCTION (Admin)
    socket.on('auction:pause', async () => {
      try {
        const state = await AuctionState.findOne();
        if (state && state.status === 'bidding') {
          stopCountdown();
          state.status = 'paused';
          state.isTimerRunning = false;
          state.message = 'Auction paused by auctioneer';
          await state.save();
          await broadcastState();
        }
      } catch (err) {
        console.error('Auction pause error:', err);
      }
    });

    // 4. RESUME AUCTION (Admin)
    socket.on('auction:resume', async () => {
      try {
        const state = await AuctionState.findOne();
        if (state && state.status === 'paused') {
          state.status = 'bidding';
          state.isTimerRunning = true;
          state.message = 'Auction resumed!';
          await state.save();
          startCountdown();
          await broadcastState();
        }
      } catch (err) {
        console.error('Auction resume error:', err);
      }
    });

    // 5. MANUAL SELL / HAMMER GAVEL (Admin)
    socket.on('auction:hammer_sell', async () => {
      try {
        const state = await AuctionState.findOne();
        if (state && state.currentPlayer && state.currentBidder) {
          await handleSell(state.currentPlayer, state.currentBidder, state.currentBid);
        } else {
          socket.emit('auction:error', { message: 'Cannot sell without an active bidder.' });
        }
      } catch (err) {
        console.error('Hammer sell error:', err);
      }
    });

    // 6. PASS / MARK UNSOLD (Admin)
    socket.on('auction:pass', async () => {
      try {
        const state = await AuctionState.findOne();
        if (state && state.currentPlayer) {
          await handleUnsold(state.currentPlayer);
        }
      } catch (err) {
        console.error('Auction pass error:', err);
      }
    });

    // 7. SELECT SPECIFIC PLAYER FOR AUCTION (Admin)
    socket.on('auction:set_player', async ({ playerId }) => {
      try {
        stopCountdown();
        const player = await Player.findById(playerId);
        if (!player) return;

        const state = await AuctionState.findOne();
        state.currentPlayer = player._id;
        state.currentBid = player.basePrice;
        state.currentBidder = null;
        state.timerSeconds = 25;
        state.isTimerRunning = false;
        state.status = 'idle';
        state.bidHistory = [];
        state.message = `Player queued: ${player.name} ($${(player.basePrice / 1000000).toFixed(1)}M base)`;
        await state.save();

        await broadcastState();
      } catch (err) {
        console.error('Set player error:', err);
      }
    });

    // 8. NEXT PLAYER IN QUEUE (Admin)
    socket.on('auction:next_player', async () => {
      try {
        stopCountdown();
        const nextPlayer = await Player.findOne({ status: 'upcoming' }).sort({ orderIndex: 1 });
        const state = await AuctionState.findOne();

        if (!nextPlayer) {
          state.status = 'completed';
          state.currentPlayer = null;
          state.isTimerRunning = false;
          state.message = 'All players in this auction draft have concluded!';
          await state.save();
          await broadcastState();
          return;
        }

        state.currentPlayer = nextPlayer._id;
        state.currentBid = nextPlayer.basePrice;
        state.currentBidder = null;
        state.timerSeconds = 25;
        state.isTimerRunning = false;
        state.status = 'idle';
        state.bidHistory = [];
        state.message = `Ready: ${nextPlayer.name} ($${(nextPlayer.basePrice / 1000000).toFixed(1)}M base)`;
        await state.save();

        await broadcastState();
      } catch (err) {
        console.error('Next player error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = { setupAuctionSocket };
