const mongoose = require('mongoose');

const emiDetailsSchema = new mongoose.Schema({
  loan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'loan_details', // Reference to the "loan" collection (if applicable)
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  },
  month: Number,
  interest: Number,
  principal: Number,
  totalpayment: Number,
  remainingBalance: Number,
  monthly_payment: Number,
  date: String,
  status: Number,
  paymentid:String,
  cheque_accountno: String,
  cheque_date: String,
  cheque_name: String,
  payment_type: String,
  paymentamount: String,
  mail_noti: Number,
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  }
});

const EmiDetails = mongoose.model('emi_details', emiDetailsSchema, 'emi_details');

module.exports = EmiDetails;