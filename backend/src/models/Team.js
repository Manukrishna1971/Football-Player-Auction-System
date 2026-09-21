const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  shortName: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  logo: {
    type: String,
    default: '⚽'
  },
  color: {
    type: String,
    default: '#10B981' // Hex accent
  },
  budget: {
    type: Number,
    required: true,
    default: 100000000 // $100M default
  },
  spent: {
    type: Number,
    default: 0
  },
  maxPlayers: {
    type: Number,
    default: 11
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for remaining budget
teamSchema.virtual('remainingBudget').get(function() {
  return Math.max(0, this.budget - this.spent);
});

// Virtual for current squad size
teamSchema.virtual('playerCount').get(function() {
  return this.players ? this.players.length : 0;
});

module.exports = mongoose.model('Team', teamSchema);
