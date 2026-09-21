const express = require('express');
const router = express.Router();
const {
  getAuctionState,
  seedDatabase,
  resetAuction,
  getBidsHistory,
  getAnalytics
} = require('../controllers/auctionController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/state', getAuctionState);
router.post('/seed', seedDatabase);
router.post('/reset', resetAuction);
router.get('/bids', getBidsHistory);
router.get('/analytics', getAnalytics);

module.exports = router;
