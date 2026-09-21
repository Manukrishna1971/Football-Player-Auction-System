const Team = require('../models/Team');
const Player = require('../models/Player');

// @desc Get all teams with squad details and budget
// @route GET /api/teams
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('players')
      .populate('manager', 'name email')
      .sort({ spent: -1 });

    const formatted = teams.map(team => {
      const squad = team.players || [];
      const totalRating = squad.reduce((sum, p) => sum + (p.stats?.overall || 0), 0);
      const avgRating = squad.length > 0 ? Math.round(totalRating / squad.length) : 0;
      
      const positions = {
        GK: squad.filter(p => p.position === 'GK').length,
        DEF: squad.filter(p => p.position === 'DEF').length,
        MID: squad.filter(p => p.position === 'MID').length,
        FWD: squad.filter(p => p.position === 'FWD').length
      };

      return {
        ...team.toObject(),
        remainingBudget: Math.max(0, team.budget - team.spent),
        playerCount: squad.length,
        avgRating,
        totalRating,
        positions
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      teams: formatted
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching teams' });
  }
};

// @desc Get single team by ID
// @route GET /api/teams/:id
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('players')
      .populate('manager', 'name email');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    const squad = team.players || [];
    const totalRating = squad.reduce((sum, p) => sum + (p.stats?.overall || 0), 0);
    const avgRating = squad.length > 0 ? Math.round(totalRating / squad.length) : 0;

    return res.status(200).json({
      success: true,
      team: {
        ...team.toObject(),
        remainingBudget: Math.max(0, team.budget - team.spent),
        playerCount: squad.length,
        avgRating,
        totalRating
      }
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Create team (Admin)
// @route POST /api/teams
exports.createTeam = async (req, res) => {
  try {
    const { name, shortName, logo, color, budget, maxPlayers } = req.body;

    const existing = await Team.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Team name already exists' });
    }

    const team = await Team.create({
      name,
      shortName: shortName || name.substring(0, 3).toUpperCase(),
      logo: logo || '🛡️',
      color: color || '#10B981',
      budget: Number(budget) || 100000000,
      maxPlayers: Number(maxPlayers) || 11
    });

    return res.status(201).json({ success: true, team });
  } catch (error) {
    console.error('Error creating team:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error creating team' });
  }
};

// @desc Update team (Admin)
// @route PUT /api/teams/:id
exports.updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    const { name, shortName, logo, color, budget, maxPlayers } = req.body;
    if (name) team.name = name;
    if (shortName) team.shortName = shortName;
    if (logo) team.logo = logo;
    if (color) team.color = color;
    if (budget !== undefined) team.budget = Number(budget);
    if (maxPlayers !== undefined) team.maxPlayers = Number(maxPlayers);

    await team.save();
    return res.status(200).json({ success: true, team });
  } catch (error) {
    console.error('Error updating team:', error);
    return res.status(500).json({ success: false, message: 'Server error updating team' });
  }
};

// @desc Get Points Table / Leaderboard ranking
// @route GET /api/teams/leaderboard/points
exports.getPointsTable = async (req, res) => {
  try {
    const teams = await Team.find().populate('players');

    const leaderboard = teams.map(team => {
      const squad = team.players || [];
      const totalRating = squad.reduce((sum, p) => sum + (p.stats?.overall || 0), 0);
      const avgRating = squad.length > 0 ? Number((totalRating / squad.length).toFixed(1)) : 0;
      
      const counts = {
        GK: squad.filter(p => p.position === 'GK').length,
        DEF: squad.filter(p => p.position === 'DEF').length,
        MID: squad.filter(p => p.position === 'MID').length,
        FWD: squad.filter(p => p.position === 'FWD').length
      };

      // Custom Football Points Algorithm:
      // 1. Squad Power: Sum of player ratings
      const powerPoints = totalRating;

      // 2. Tactical Balance Bonus: +15 points for each position filled with at least 1 player
      let balanceBonus = 0;
      if (counts.GK >= 1) balanceBonus += 15;
      if (counts.DEF >= 1) balanceBonus += 15;
      if (counts.MID >= 1) balanceBonus += 15;
      if (counts.FWD >= 1) balanceBonus += 15;

      // 3. Efficiency Bonus: Points for spending efficiency (remaining budget preserved without leaving empty squad)
      const remaining = Math.max(0, team.budget - team.spent);
      const budgetEfficiency = Math.round((remaining / team.budget) * 20);

      // Total Leaderboard Score
      const totalPoints = powerPoints + balanceBonus + budgetEfficiency;

      return {
        id: team._id,
        name: team.name,
        shortName: team.shortName,
        logo: team.logo,
        color: team.color,
        playersCount: squad.length,
        maxPlayers: team.maxPlayers,
        totalSpent: team.spent,
        remainingBudget: remaining,
        budget: team.budget,
        avgRating,
        totalRating,
        positions: counts,
        balanceBonus,
        efficiencyBonus: budgetEfficiency,
        points: totalPoints,
        topPlayer: squad.length > 0 ? squad.reduce((top, p) => (p.stats?.overall > top.stats?.overall ? p : top), squad[0]) : null
      };
    });

    // Sort by points descending
    leaderboard.sort((a, b) => b.points - a.points);

    // Assign rank
    const ranked = leaderboard.map((item, index) => ({
      ...item,
      rank: index + 1
    }));

    return res.status(200).json({
      success: true,
      leaderboard: ranked
    });
  } catch (error) {
    console.error('Error generating points table:', error);
    return res.status(500).json({ success: false, message: 'Server error calculating leaderboard' });
  }
};
