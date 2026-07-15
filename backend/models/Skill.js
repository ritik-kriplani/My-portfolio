const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  iconClass: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'General'
  },
  level: {
    type: Number,
    default: 80
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Skill', SkillSchema);
