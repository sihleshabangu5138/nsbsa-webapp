// models/rePayment.js

const mongoose = require('mongoose');

const rePaymentSchema = new mongoose.Schema({
  payment_type: String,
  repayments: String,
  repaymentamount: String,
  cheque_name: String,
  cheque_accountno: String,
  cheque_date: String,
  date: String,
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  }
});

const RePayment = mongoose.model('Re_Payments', rePaymentSchema,'re_payments');

module.exports = RePayment;
