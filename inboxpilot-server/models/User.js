// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  refreshToken: String,
  rollupFreq: { type: String, default: 'weekly' },
});

module.exports = mongoose.model('User', userSchema);
