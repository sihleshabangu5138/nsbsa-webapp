const mongoose = require('mongoose');

const loanDetailsSchema = new mongoose.Schema({
  loancount: String,
  loantype: { type: mongoose.Schema.Types.ObjectId, ref: 'loantype' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  description: String,
  document: [String],
  loanamount: String,
  interestrate: String,
  years: String,
  startdate: String,
  enddate: String,
  totalemimonth: String,
  processingfee: String,
  incomeperyear: String,
  incomepermonth: String,
  oincome: String,
  workdetail: String,
  colleague: String,
  address: String,
  mobile: String,
  addtype: String,
  othertext: String,
  status: Number,
  approvestatus: Number,
  createdby: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
});

const LoanDetails = mongoose.model('loan_details', loanDetailsSchema,'loan_details');

module.exports = LoanDetails;