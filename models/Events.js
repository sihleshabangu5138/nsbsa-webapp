const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventtype: String,
  eventtitle: String,
  eventvenue: String,
  duration: String,
  startdate: String,
  enddate: String,
  eventfor: {
    type: mongoose.Schema.Types.Mixed,
  },
  eventdetail: String,
  addedby: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
});

// eventfor: {
//   type: mongoose.Schema.Types.Mixed,
//   ref: 'roles',
// }, 
const Event = mongoose.model('events', eventSchema, 'events');

module.exports = Event;  