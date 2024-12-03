const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationBadgesSchema = new mongoose.Schema({
  action: String,
  desc: String,
  loan: { type: mongoose.Schema.Types.ObjectId, ref: 'loan_details' }, // Assuming you have a "Loan" model
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, // Assuming you have a "User" model
  userby: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  Name: String,
  date: String,
  status: Number,
},{timestamps:true});

const NotificationBadges = mongoose.model('notification_badges', notificationBadgesSchema,'notification_badges');

module.exports = NotificationBadges;