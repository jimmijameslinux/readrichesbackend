const mongoose = require('mongoose');

// // signup
const userSchema = new mongoose.Schema({
  email: String,
  password: String || undefined,
});

const User = mongoose.model('User', userSchema);

module.exports = User;