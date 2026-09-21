const express = require('express');
const router = express.Router();
const {
  getPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
  clearAllPlayers,
  seedLocalTournament
} = require('../controllers/playerController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getPlayers);
router.post('/clear-all', protect, clearAllPlayers);
router.post('/seed-local', protect, seedLocalTournament);
router.get('/:id', getPlayerById);
router.post('/', protect, upload.single('photo'), createPlayer);
router.put('/:id', protect, upload.single('photo'), updatePlayer);
router.delete('/:id', protect, deletePlayer);

module.exports = router;
