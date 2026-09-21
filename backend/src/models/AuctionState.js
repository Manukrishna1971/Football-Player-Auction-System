const mongoose = require('mongoose');

const auctionStateSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['idle', 'bidding', 'paused', 'sold', 'unsold', 'completed'],
    default: 'idle'
  },
  currentPlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    default: null
  },
  currentBid: {
    type: Number,
    default: 0
  },
  currentBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  timerSeconds: {
    type: Number,
    default: 20
  },
  initialTimer: {
    type: Number,
    default: 20
  },
  isTimerRunning: {
    type: Boolean,
    default: false
  },
  bidHistory: [{
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    teamName: String,
    teamShort: String,
    teamColor: String,
    amount: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  message: {
    type: String,
    default: 'Auction arena is ready'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AuctionState', auctionStateSchema);
