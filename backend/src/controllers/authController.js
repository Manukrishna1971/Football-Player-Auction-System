const User = require('../models/User');
const Team = require('../models/Team');
const { generateToken } = require('../middleware/auth');

// @desc Login user
// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).populate('team');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: user.team ? {
          id: user.team._id,
          name: user.team.name,
          shortName: user.team.shortName,
          logo: user.team.logo,
          color: user.team.color,
          budget: user.team.budget,
          spent: user.team.spent,
          remainingBudget: user.team.remainingBudget
        } : null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc Register a new user
// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role = 'manager', teamName, teamShortName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    let teamId = null;
    if (role === 'manager' && teamName) {
      const existingTeam = await Team.findOne({ name: teamName });
      if (existingTeam) {
        teamId = existingTeam._id;
      } else {
        const newTeam = await Team.create({
          name: teamName,
          shortName: teamShortName || teamName.substring(0, 3).toUpperCase(),
          budget: 100000000
        });
        teamId = newTeam._id;
      }
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      team: teamId
    });

    if (teamId) {
      await Team.findByIdAndUpdate(teamId, { manager: user._id });
    }

    const token = generateToken(user._id);
    const populatedUser = await User.findById(user._id).populate('team');

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role,
        team: populatedUser.team
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

// @desc Get current logged in user
// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'team',
      populate: { path: 'players' }
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: user.team
      }
    });
  } catch (error) {
    console.error('GetMe error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching user profile' });
  }
};

// @desc Get demo credentials for 1-click easy testing in UI
// @route GET /api/auth/demo-accounts
exports.getDemoAccounts = async (req, res) => {
  try {
    const users = await User.find().populate('team');
    const demoAccounts = users.map(u => ({
      name: u.name,
      email: u.email,
      role: u.role,
      teamName: u.team ? u.team.name : null,
      teamShort: u.team ? u.team.shortName : null,
      teamColor: u.team ? u.team.color : null,
      teamLogo: u.team ? u.team.logo : null
    }));

    return res.status(200).json({
      success: true,
      demoAccounts
    });
  } catch (error) {
    console.error('Demo accounts error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
