'use strict';
const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/Activitylog');
const User = require('../models/User');

exports.getActivitylog = async function (req, res, next) {
  try {
    const activityLogs = await ActivityLog.find().sort({ "d": -1 }).lean();

    const user = await User.find({ "_id": activityLogs[0].user }).lean();
    if (activityLogs.length > 0) {

      res.render("activitylog/activitylog", {
        title: "Activity Log",
        session: req.session,
        messages: req.flash(),
        activity: activityLogs,
        user: user
      });
    } else {
      const news = [{ "userid": "-1" }];

      res.render("activitylog/activitylog", {
        title: "Activity Log",
        session: req.session,
        messages: req.flash(),
        activity: news,
        user: user,
      });
    }
  } catch (err) {
    next(err);
  }
}