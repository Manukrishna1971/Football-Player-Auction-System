const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 10,
    max: 60
  },
  jerseyNumber: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    required: true,
    enum: ['GK', 'DEF', 'MID', 'FWD']
  },
  nationality: {
    type: String,
    default: 'Local',
    trim: true
  },
  club: {
    type: String,
    default: 'Local Free Agent',
    trim: true
  },
  category: {
    type: String,
    default: 'Local Talent', // e.g. Marquee, Local Star, Youth, Veteran
    trim: true
  },
  phone: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0 // Flexible for local tournament currency or points
  },
  currentPrice: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'in_auction', 'sold', 'unsold'],
    default: 'upcoming'
  },
  soldTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  stats: {
    pace: { type: Number, default: 75, min: 1, max: 99 },
    shooting: { type: Number, default: 75, min: 1, max: 99 },
    passing: { type: Number, default: 75, min: 1, max: 99 },
    dribbling: { type: Number, default: 75, min: 1, max: 99 },
    defending: { type: Number, default: 75, min: 1, max: 99 },
    physical: { type: Number, default: 75, min: 1, max: 99 },
    overall: { type: Number, default: 75, min: 1, max: 99 }
  },
  photoUrl: {
    type: String,
    default: ''
  },
  orderIndex: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Player', playerSchema);
