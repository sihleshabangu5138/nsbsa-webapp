// models/familydata.js

const mongoose = require('mongoose');

const familydataSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  familymember: String,
  relationship: String,
  famoccupation: String,
  famcontact: String,
  income: String,
});

const FamilyData = mongoose.model('familydata', familydataSchema, 'familydatas');

module.exports = FamilyData;
