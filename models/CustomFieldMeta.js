const mongoose = require('mongoose');

const customFieldMetaSchema = new mongoose.Schema({
  custom_field_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'customfields' },
  customfield_value: [String],
  module: String,
  user_id:{ type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  reference_id: mongoose.Schema.Types.ObjectId,
  updated_at: String,
});

// Create a "CustomFieldMeta" model based on the schema
const CustomFieldMeta = mongoose.model('custom_field_meta', customFieldMetaSchema, 'custom_field_metas');

// Export the model
module.exports = CustomFieldMeta;
