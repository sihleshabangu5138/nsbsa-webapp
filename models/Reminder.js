const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  reminder_nm: String,
  reminder_template: String,
  reminder_desc: String,
  reminder_will_send: String,
  reminder_type: String,
  reminderdata: [
    {
      number: Number,
      recurense: String,
    },
  ],
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  }
});

const Reminder = mongoose.model('Reminder', reminderSchema,'reminders');

module.exports = Reminder;
