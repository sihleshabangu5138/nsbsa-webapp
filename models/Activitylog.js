const mongoose = require('mongoose');
const activityLogSchema = new mongoose.Schema({
  date: String,
  module: String,
  action: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', // Assuming you have a User model
  },
  item: String,
  status: Number,
});

const ActivityLog = mongoose.model('activityLog', activityLogSchema,'activitylogs');

module.exports = ActivityLog;
