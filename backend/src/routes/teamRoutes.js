const express = require('express');
const router = express.Router();
const {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  getPointsTable
} = require('../controllers/teamController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getTeams);
router.get('/leaderboard/points', getPointsTable);
router.get('/:id', getTeamById);
router.post('/', protect, adminOnly, createTeam);
router.put('/:id', protect, adminOnly, updateTeam);

module.exports = router;
