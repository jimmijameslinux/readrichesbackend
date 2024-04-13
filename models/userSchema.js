const mongoose = require('mongoose');
// const { Schema } = mongoose;

// // signup
const userSchema = new mongoose.Schema({
  name: String || undefined,
  email: String,
  password: String,
  picture: String || undefined,
  // loginStatus: Boolean || undefined,
  creditscore: Number,
});

// google signup
const googleUserSchema = new mongoose.Schema({
  name: String,
  email: String,
  picture: String,
  // loginStatus: Boolean || undefined,
  creditscore: Number,
  newname: String || null,
  newpicture: String || null,
});

// user dashboard with userSchema or googleUserSchema id and cardSchema id
const userDashboardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }|| { type: mongoose.Schema.Types.ObjectId, ref: 'GoogleUser' } || undefined,
  card: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
  progressvalue: String || undefined,
});

// membersubscription
const memberSubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } || { type: mongoose.Schema.Types.ObjectId, ref: 'GoogleUser' } || undefined,
  subscriptiontype: String,
  subscriptiontaken: Boolean,
  subscriptionstartdate: String,
  subscriptionenddate: String,
});

// const userProfile = new mongoose.Schema({
//   name: String,
//   picture: String|| undefined,
// });

const User = mongoose.model('User', userSchema);
const User_2 = mongoose.model('GoogleUser', googleUserSchema);
const UserDashboard = mongoose.model('UserDashboard', userDashboardSchema);
const MemberSubscription = mongoose.model('MemberSubscription', memberSubscriptionSchema);
// const UserProfile = mongoose.model('UserProfile', userProfile);

module.exports = { User, User_2, UserDashboard, MemberSubscription};