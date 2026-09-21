const Player = require('../models/Player');
const Team = require('../models/Team');
const AuctionState = require('../models/AuctionState');

// @desc Get all players with search, filter, sort
// @route GET /api/players
exports.getPlayers = async (req, res) => {
  try {
    const { search, position, status, minPrice, maxPrice, sortBy, sortOrder } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nationality: { $regex: search, $options: 'i' } },
        { club: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { jerseyNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (position && position !== 'ALL') {
      filter.position = position;
    }

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = Number(minPrice);
      if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
    }

    let sortOptions = { orderIndex: 1, createdAt: -1 };
    if (sortBy) {
      const order = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'rating') sortOptions = { 'stats.overall': order };
      else if (sortBy === 'price') sortOptions = { basePrice: order };
      else if (sortBy === 'name') sortOptions = { name: order };
      else if (sortBy === 'jersey') sortOptions = { jerseyNumber: order };
    }

    const players = await Player.find(filter)
      .populate('soldTo', 'name shortName logo color')
      .sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: players.length,
      players
    });
  } catch (error) {
    console.error('Error fetching players:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching players' });
  }
};

// @desc Get single player by ID
// @route GET /api/players/:id
exports.getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id).populate('soldTo', 'name shortName logo color');
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }
    return res.status(200).json({ success: true, player });
  } catch (error) {
    console.error('Error fetching player by id:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Create new local tournament player
// @route POST /api/players
exports.createPlayer = async (req, res) => {
  try {
    const {
      name,
      age,
      jerseyNumber,
      position,
      nationality,
      club,
      category,
      phone,
      notes,
      basePrice,
      photoUrl,
      stats,
      overall
    } = req.body;

    let parsedStats = {
      pace: 75,
      shooting: 75,
      passing: 75,
      dribbling: 75,
      defending: 75,
      physical: 75,
      overall: Number(overall) || 75
    };

    if (stats) {
      const parsed = typeof stats === 'string' ? JSON.parse(stats) : stats;
      parsedStats = { ...parsedStats, ...parsed };
    }

    if (overall && !stats) {
      const o = Number(overall);
      parsedStats = {
        pace: o,
        shooting: o,
        passing: o,
        dribbling: o,
        defending: o,
        physical: o,
        overall: o
      };
    } else if (!parsedStats.overall) {
      const vals = [
        parsedStats.pace || 75,
        parsedStats.shooting || 75,
        parsedStats.passing || 75,
        parsedStats.dribbling || 75,
        parsedStats.defending || 75,
        parsedStats.physical || 75
      ];
      parsedStats.overall = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    }

    let finalPhotoUrl = photoUrl || '';
    if (req.file) {
      finalPhotoUrl = `/uploads/${req.file.filename}`;
    }

    const count = await Player.countDocuments();

    const player = await Player.create({
      name,
      age: Number(age) || 24,
      jerseyNumber: jerseyNumber ? String(jerseyNumber) : '',
      position: position || 'FWD',
      nationality: nationality || 'Local',
      club: club || 'Local Free Agent',
      category: category || 'Local Talent',
      phone: phone || '',
      notes: notes || '',
      basePrice: Number(basePrice) || 1000,
      currentPrice: Number(basePrice) || 1000,
      stats: parsedStats,
      photoUrl: finalPhotoUrl,
      orderIndex: count + 1
    });

    return res.status(201).json({ success: true, player });
  } catch (error) {
    console.error('Error creating player:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error creating player' });
  }
};

// @desc Update local tournament player details
// @route PUT /api/players/:id
exports.updatePlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    const {
      name,
      age,
      jerseyNumber,
      position,
      nationality,
      club,
      category,
      phone,
      notes,
      basePrice,
      status,
      photoUrl,
      stats,
      overall,
      soldTo
    } = req.body;

    if (name !== undefined) player.name = name;
    if (age !== undefined) player.age = Number(age);
    if (jerseyNumber !== undefined) player.jerseyNumber = String(jerseyNumber);
    if (position !== undefined) player.position = position;
    if (nationality !== undefined) player.nationality = nationality;
    if (club !== undefined) player.club = club;
    if (category !== undefined) player.category = category;
    if (phone !== undefined) player.phone = phone;
    if (notes !== undefined) player.notes = notes;
    if (basePrice !== undefined) {
      player.basePrice = Number(basePrice);
      if (player.status === 'upcoming' || player.status === 'in_auction') {
        player.currentPrice = Number(basePrice);
      }
    }
    if (status !== undefined) player.status = status;
    if (soldTo !== undefined) player.soldTo = soldTo;

    if (photoUrl !== undefined) player.photoUrl = photoUrl;
    if (req.file) {
      player.photoUrl = `/uploads/${req.file.filename}`;
    }

    if (stats) {
      const parsedStats = typeof stats === 'string' ? JSON.parse(stats) : stats;
      player.stats = { ...player.stats.toObject(), ...parsedStats };
    }

    if (overall !== undefined) {
      player.stats.overall = Number(overall);
    }

    await player.save();

    // If this player is currently in auction, update the live auction state as well!
    const state = await AuctionState.findOne();
    if (state && state.currentPlayer && state.currentPlayer.toString() === player._id.toString()) {
      if (state.currentBidder === null) {
        state.currentBid = player.basePrice;
      }
      state.message = `Updated player: ${player.name} (${player.position}, Base: ${player.basePrice})`;
      await state.save();
    }

    const updated = await Player.findById(player._id).populate('soldTo', 'name shortName logo color');

    return res.status(200).json({ success: true, player: updated });
  } catch (error) {
    console.error('Error updating player:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error updating player' });
  }
};

// @desc Delete player
// @route DELETE /api/players/:id
exports.deletePlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    // Remove from team if assigned
    if (player.soldTo) {
      await Team.findByIdAndUpdate(player.soldTo, {
        $pull: { players: player._id }
      });
    }

    await Player.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Player removed successfully' });
  } catch (error) {
    console.error('Error deleting player:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting player' });
  }
};

// @desc Clear all players (to start fresh local tournament draft)
// @route POST /api/players/clear-all
exports.clearAllPlayers = async (req, res) => {
  try {
    await Player.deleteMany({});
    await Team.updateMany({}, { players: [], spent: 0 });
    
    let state = await AuctionState.findOne();
    if (state) {
      state.currentPlayer = null;
      state.currentBidder = null;
      state.currentBid = 0;
      state.status = 'idle';
      state.bidHistory = [];
      state.message = 'All players cleared. Ready to add your local tournament players!';
      await state.save();
    }

    return res.status(200).json({ success: true, message: 'All players cleared for fresh tournament draft' });
  } catch (error) {
    console.error('Error clearing players:', error);
    return res.status(500).json({ success: false, message: 'Server error clearing players' });
  }
};

// @desc Seed 12 sample local tournament players with local community pricing
// @route POST /api/players/seed-local
exports.seedLocalTournament = async (req, res) => {
  try {
    const localPlayers = [
      {
        name: 'Alex "Striker" Mercer',
        age: 23,
        jerseyNumber: '9',
        position: 'FWD',
        nationality: 'Local District',
        club: 'North End Strikers',
        category: 'Local Star',
        phone: '+1 (555) 234-5678',
        notes: 'Top goal scorer in city amateur cup (18 goals)',
        basePrice: 5000,
        stats: { pace: 88, shooting: 85, passing: 74, dribbling: 82, defending: 42, physical: 78, overall: 82 },
        photoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&auto=format&fit=crop&q=80'
      },
      {
        name: 'Carlos "El Muro" Gomez',
        age: 27,
        jerseyNumber: '4',
        position: 'DEF',
        nationality: 'Downtown',
        club: 'Downtown FC',
        category: 'Veteran',
        phone: '+1 (555) 345-6789',
        notes: 'Solid center-back, aerial master',
        basePrice: 4000,
        stats: { pace: 72, shooting: 50, passing: 68, dribbling: 65, defending: 86, physical: 84, overall: 80 },
        photoUrl: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=300&auto=format&fit=crop&q=80'
      },
      {
        name: 'Rahul "Maestro" Sharma',
        age: 25,
        jerseyNumber: '10',
        position: 'MID',
        nationality: 'Central Ward',
        club: 'Central Wolves',
        category: 'Marquee Playmaker',
        phone: '+1 (555) 456-7890',
        notes: 'Free-kick specialist and assist leader',
        basePrice: 6000,
        stats: { pace: 76, shooting: 78, passing: 88, dribbling: 84, defending: 62, physical: 70, overall: 83 },
        photoUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=300&auto=format&fit=crop&q=80'
      },
      {
        name: 'Sam "Spider" Higgins',
        age: 29,
        jerseyNumber: '1',
        position: 'GK',
        nationality: 'Harbor Town',
        club: 'Harbor Rangers',
        category: 'Local Star',
        phone: '+1 (555) 567-8901',
        notes: 'Golden Glove winner last 2 seasons',
        basePrice: 4500,
        stats: { pace: 60, shooting: 82, passing: 72, dribbling: 78, defending: 50, physical: 82, overall: 81 },
        photoUrl: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=300&auto=format&fit=crop&q=80'
      },
      {
        name: 'Liam "Flash" Davies',
        age: 20,
        jerseyNumber: '11',
        position: 'FWD',
        nationality: 'Eastside',
        club: 'Eastside Academy',
        category: 'Emerging Youth',
        phone: '+1 (555) 678-9012',
        notes: 'Blistering pace down the left wing',
        basePrice: 3500,
        stats: { pace: 92, shooting: 75, passing: 70, dribbling: 83, defending: 38, physical: 68, overall: 78 },
        photoUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&auto=format&fit=crop&q=80'
      },
      {
        name: 'Marcus "Tank" Chen',
        age: 26,
        jerseyNumber: '6',
        position: 'MID',
        nationality: 'Westside',
        club: 'Westside United',
        category: 'Local Talent',
        phone: '+1 (555) 789-0123',
        notes: 'Box-to-box engine and hard tackler',
        basePrice: 3500,
        stats: { pace: 74, shooting: 70, passing: 75, dribbling: 72, defending: 80, physical: 85, overall: 79 },
        photoUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&auto=format&fit=crop&q=80'
      },
      {
        name: 'Mateo Rossi',
        age: 22,
        jerseyNumber: '2',
        position: 'DEF',
        nationality: 'Valley',
        club: 'Green Valley FC',
        category: 'Emerging Youth',
        phone: '+1 (555) 890-1234',
        notes: 'Overlapping fullback with great crossing',
        basePrice: 3000,
        stats: { pace: 84, shooting: 60, passing: 74, dribbling: 76, defending: 75, physical: 72, overall: 77 },
        photoUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&auto=format&fit=crop&q=80'
      },
      {
        name: 'Tariq Al-Mansoor',
        age: 24,
        jerseyNumber: '7',
        position: 'FWD',
        nationality: 'Metro',
        club: 'Metro Strikers',
        category: 'Local Talent',
        phone: '+1 (555) 901-2345',
        notes: 'Clinical finisher inside the 18-yard box',
        basePrice: 4000,
        stats: { pace: 80, shooting: 84, passing: 70, dribbling: 78, defending: 35, physical: 74, overall: 79 },
        photoUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=300&auto=format&fit=crop&q=80'
      }
    ];

    await Player.deleteMany({});
    const created = [];
    for (let i = 0; i < localPlayers.length; i++) {
      const p = localPlayers[i];
      const plyr = await Player.create({
        ...p,
        currentPrice: p.basePrice,
        status: 'upcoming',
        orderIndex: i + 1
      });
      created.push(plyr);
    }

    // Set first player in arena
    const first = created[0];
    let state = await AuctionState.findOne();
    if (!state) state = new AuctionState();
    state.currentPlayer = first._id;
    state.currentBid = first.basePrice;
    state.currentBidder = null;
    state.timerSeconds = 25;
    state.status = 'idle';
    state.bidHistory = [];
    state.message = `Local Tournament Ready: ${first.name} (Base: $${first.basePrice.toLocaleString()})`;
    await state.save();

    return res.status(200).json({
      success: true,
      message: `Seeded ${created.length} local tournament players with community base prices!`,
      players: created
    });
  } catch (error) {
    console.error('Seed local tournament error:', error);
    return res.status(500).json({ success: false, message: 'Server error seeding local tournament' });
  }
};
