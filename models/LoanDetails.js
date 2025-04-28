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
  monthly_payment: String,
  first_monthly_payment: String,
  initiationfee: String,
  administrationfee: String,
  incomeperyear: String,
  incomepermonth: String,
  oincome: String,
  workdetail: String,

  customer: String,
  customerid: String,
  email: String,  
  mobile: String,
  grouppeople: String,
  nextofkin: String,
  gender: String,
  disability: String,
  addtype: String,
  othertext: String,
  address: String,

  groupnameandnumber: String,
  leadernameandnumber: String,
  memberapproval: String,
  motivation: String,

  status: Number,
  approvestatus: Number,
  loanpaid: Number,
  createdby: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
});

const LoanDetails = mongoose.model('loan_details', loanDetailsSchema,'loan_details');

module.exports = LoanDetails;