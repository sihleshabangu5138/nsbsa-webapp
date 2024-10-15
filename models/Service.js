const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  servicename: String,
  categorytypes: String,
  servicefor: String,
  description: String,
  uploadimages: [String], // Assuming it's an array of image paths
  tagname: [String], // Assuming it's an array of tags
  duration_hour: String,
  duration_minute: String,
  pricetype: String,
  price: String,
  assigned_staff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  }], // Assuming it's an array of staff names or IDs
  user_capacity: String,
  enable_online_booking: String,
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  }
});

const Service = mongoose.model('service', serviceSchema, 'services');

module.exports = Service;
