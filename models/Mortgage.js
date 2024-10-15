const mongoose = require('mongoose');

const mortgageSchema = new mongoose.Schema({
  loan_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mortgage', // Reference to itself, assuming that the loan_id refers to another document of the same collection
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', // Reference to itself, assuming that the user_id refers to another document of the same collection
  },
  month: Number,
  interest: Number,
  capital: Number,
  next_due_date: Date,
});

const Mortgage = mongoose.model('mortgage', mortgageSchema);

module.exports = Mortgage;
