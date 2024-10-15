const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema({
  module_name: String,
  label: String,
  field_type: String,
  validation: [String],
  minival: String,
  maxival: String,
  field_visibility: Number,
  d_label: [String],
  c_label: [String],
  r_label: [String],
  filetype: String,
  filesize: String,
});

const CustomField = mongoose.model('customfields', customFieldSchema, 'customfields');

module.exports = CustomField;
