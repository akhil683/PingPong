const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    length: 6
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  players: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: {
      type: Number,
      default: 0
    },
    isDrawing: {
      type: Boolean,
      default: false
    }
  }],
  rounds: {
    type: Number,
    default: 3,
    min: 1,
    max: 10
  },
  currentRound: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['WAITING', 'IN_PROGRESS', 'COMPLETED'],
    default: 'WAITING'
  },
  currentWord: {
    type: String,
    default: null
  },
  timeLimit: {
    type: Number,
    default: 60, // seconds
    min: 30,
    max: 180
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Game', GameSchema);
