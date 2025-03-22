// models/rule.js
const mongoose = require('mongoose');

// Define the schema for the Rule collection
const ruleSchema = new mongoose.Schema({
  loantype: String,
  rule_title: String,
  rule_desc: String,
  rule_image: [String],
  loan_amount_rule: String,
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  }
});

// Create a "Rule" model based on the schema
const Rule = mongoose.model('Rule', ruleSchema,'rules',);

// Export the model
module.exports = Rule;
