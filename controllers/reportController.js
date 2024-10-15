'use strict';

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const LoanDetails = require('../models/LoanDetails');


exports.getReport = async (req, res, next) => {
  try {
    const activeuser = await User.countDocuments({ status: 1 });
    const deactiveuser = await User.countDocuments({ status: 0 });
    const num_of_loan = await LoanDetails.countDocuments({ $and: [{ status: 1 }, { approvestatus: 1 }] });
    const num_of_disloan = await LoanDetails.countDocuments({ $and: [{ status: 1 }, { approvestatus: 0 }] });

    res.render('report/report', {
      title: 'report',
      session: req.session,
      messages: req.flash(),
      activecount: activeuser,
      loanno: num_of_loan,
      deactivecount: deactiveuser,
      deloanno: num_of_disloan,
    });
  } catch (error) {
    next(error);
  }
};

