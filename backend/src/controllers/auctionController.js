const AuctionState = require('../models/AuctionState');
const Player = require('../models/Player');
const Team = require('../models/Team');
const User = require('../models/User');
const Bid = require('../models/Bid');
const seedData = require('../data/seedData');

// Ensure auction state document exists
async function getOrCreateState() {
  let state = await AuctionState.findOne()
    .populate('currentPlayer')
    .populate('currentBidder');

  if (!state) {
    state = await AuctionState.create({
      status: 'idle',
      timerSeconds: 20,
      initialTimer: 20,
      message: 'Auction arena is ready'
    });
    state = await AuctionState.findById(state._id)
      .populate('currentPlayer')
      .populate('currentBidder');
  }
  return state;
}

// @desc Get live auction state
// @route GET /api/auction/state
exports.getAuctionState = async (req, res) => {
  try {
    const state = await getOrCreateState();
    return res.status(200).json({ success: true, state });
  } catch (error) {
    console.error('Error getting auction state:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Seed database with star players, teams and accounts
// @route POST /api/auction/seed
exports.seedDatabase = async (req, res) => {
  try {
    console.log('[Seed] Wiping previous data...');
    await User.deleteMany({});
    await Team.deleteMany({});
    await Player.deleteMany({});
    await Bid.deleteMany({});
    await AuctionState.deleteMany({});

    console.log('[Seed] Creating Admin account...');
    const admin = await User.create(seedData.admin);

    console.log('[Seed] Creating Teams & Managers...');
    const createdTeams = [];
    for (const t of seedData.teams) {
      const managerUser = await User.create(t.managerUser);
      const team = await Team.create({
        name: t.name,
        shortName: t.shortName,
        logo: t.logo,
        color: t.color,
        budget: t.budget,
        maxPlayers: t.maxPlayers,
        manager: managerUser._id
      });
      // associate team to manager
      managerUser.team = team._id;
      await managerUser.save();
      createdTeams.push(team);
    }

    console.log('[Seed] Creating Players...');
    const createdPlayers = [];
    for (const p of seedData.players) {
      const player = await Player.create({
        ...p,
        currentPrice: p.basePrice,
        status: 'upcoming'
      });
      createdPlayers.push(player);
    }

    // Set first player as current player in idle auction state
    const firstPlayer = createdPlayers[0];
    const auctionState = await AuctionState.create({
      status: 'idle',
      currentPlayer: firstPlayer._id,
      currentBid: firstPlayer.basePrice,
      currentBidder: null,
      timerSeconds: 20,
      initialTimer: 20,
      isTimerRunning: false,
      bidHistory: [],
      message: `Next up: ${firstPlayer.name} with base price $${(firstPlayer.basePrice / 1000000).toFixed(1)}M`
    });

    console.log('[Seed] Seeding completed successfully!');
    return res.status(200).json({
      success: true,
      message: 'Database seeded successfully with teams, players, and accounts!',
      counts: {
        users: 1 + createdTeams.length,
        teams: createdTeams.length,
        players: createdPlayers.length
      }
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error seeding database' });
  }
};

// @desc Reset auction progress (resets players, teams, bids)
// @route POST /api/auction/reset
exports.resetAuction = async (req, res) => {
  try {
    // Reset all players to upcoming and clear soldTo
    await Player.updateMany({}, {
      status: 'upcoming',
      soldTo: null,
      $set: { currentPrice: '$basePrice' }
    });

    // Reset team spent and squad
    await Team.updateMany({}, {
      spent: 0,
      players: []
    });

    // Clear bids
    await Bid.deleteMany({});

    // Reset auction state
    const firstPlayer = await Player.findOne().sort({ orderIndex: 1 });
    let state = await AuctionState.findOne();
    if (!state) {
      state = new AuctionState();
    }
    state.status = 'idle';
    state.currentPlayer = firstPlayer ? firstPlayer._id : null;
    state.currentBid = firstPlayer ? firstPlayer.basePrice : 0;
    state.currentBidder = null;
    state.timerSeconds = 20;
    state.isTimerRunning = false;
    state.bidHistory = [];
    state.message = firstPlayer ? `Auction reset. Ready for ${firstPlayer.name}` : 'Auction arena reset';
    await state.save();

    const populated = await AuctionState.findById(state._id)
      .populate('currentPlayer')
      .populate('currentBidder');

    return res.status(200).json({
      success: true,
      message: 'Auction reset successfully!',
      state: populated
    });
  } catch (error) {
    console.error('Error resetting auction:', error);
    return res.status(500).json({ success: false, message: 'Server error resetting auction' });
  }
};

// @desc Get recent bids history
// @route GET /api/auction/bids
exports.getBidsHistory = async (req, res) => {
  try {
    const bids = await Bid.find()
      .populate('player', 'name position nationality photoUrl stats')
      .populate('team', 'name shortName logo color')
      .populate('user', 'name email')
      .sort({ timestamp: -1 })
      .limit(50);

    return res.status(200).json({ success: true, count: bids.length, bids });
  } catch (error) {
    console.error('Error getting bids history:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Get auction analytics & insights
// @route GET /api/auction/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalPlayers = await Player.countDocuments();
    const soldPlayers = await Player.find({ status: 'sold' }).populate('soldTo', 'name shortName color logo');
    const unsoldPlayers = await Player.countDocuments({ status: 'unsold' });
    const upcomingPlayers = await Player.countDocuments({ status: 'upcoming' });
    
    const teams = await Team.find();
    const totalBudget = teams.reduce((sum, t) => sum + t.budget, 0);
    const totalSpent = teams.reduce((sum, t) => sum + t.spent, 0);

    // Position breakdown of sold players
    const positionSpend = {
      GK: { count: 0, spent: 0 },
      DEF: { count: 0, spent: 0 },
      MID: { count: 0, spent: 0 },
      FWD: { count: 0, spent: 0 }
    };

    soldPlayers.forEach(p => {
      if (positionSpend[p.position]) {
        positionSpend[p.position].count += 1;
        positionSpend[p.position].spent += p.currentPrice || p.basePrice;
      }
    });

    // Top 5 most expensive players
    const topBuys = [...soldPlayers]
      .sort((a, b) => (b.currentPrice || b.basePrice) - (a.currentPrice || a.basePrice))
      .slice(0, 5)
      .map(p => ({
        id: p._id,
        name: p.name,
        position: p.position,
        rating: p.stats?.overall || 80,
        club: p.club,
        basePrice: p.basePrice,
        soldPrice: p.currentPrice,
        inflation: Math.round(((p.currentPrice - p.basePrice) / p.basePrice) * 100),
        team: p.soldTo
      }));

    return res.status(200).json({
      success: true,
      analytics: {
        totalPlayers,
        soldCount: soldPlayers.length,
        unsoldCount: unsoldPlayers,
        upcomingCount: upcomingPlayers,
        totalBudget,
        totalSpent,
        remainingBudget: Math.max(0, totalBudget - totalSpent),
        averagePlayerPrice: soldPlayers.length > 0 ? Math.round(totalSpent / soldPlayers.length) : 0,
        positionSpend,
        topBuys
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching analytics' });
  }
};
