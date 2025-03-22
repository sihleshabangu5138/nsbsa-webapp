const mongoose = require('mongoose');

const loantypeSchema = new mongoose.Schema({
  type: String,
  loan_desc: String,
  loan_min_amount: String,
  loan_max_amount: String,
  interestrate: String,
  latepaymentcharge: String,
  processingfee: String,
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  },
  updatedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', 
  }
});

const Loantype = mongoose.model('loantype', loantypeSchema, 'loantypes');

module.exports = Loantype;
