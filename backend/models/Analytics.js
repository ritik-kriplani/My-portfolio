const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  ip: {
    type: String,
    default: 'anonymous'
  },
  country: {
    type: String,
    default: 'Unknown'
  },
  region: {
    type: String,
    default: 'Unknown'
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  os: {
    type: String,
    default: 'Unknown'
  },
  device: {
    type: String,
    default: 'Desktop'
  },
  path: {
    type: String,
    default: '/'
  },
  eventType: {
    type: String,
    enum: ['pageview', 'click'],
    default: 'pageview'
  },
  elementId: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
