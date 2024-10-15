'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const moment = require('moment');
const lang = require('../config/languageconfig');
const User = require('../models/User'); // Create a Mongoose model for User
const Role = require('../models/Role'); // Create a Mongoose model for Role
const GeneralSetting = require('../models/GeneralSetting'); // Create a Mongoose model for Generalsetting
const EmiDetails = require('../models/Emi_details');


exports.getImpersonate = async (req, res) => {
  const languages = lang.getLocale();
  res.render('impersonate/impersonateuser', {
    title: 'Impersonate',
    session: req.session,
    messages: req.flash(),
  });
};
exports.postImpersonate = async (req, res) => {
  try {
    const myquery = { "email": req.body.email };
    const query = { "_id": new mongoose.Types.ObjectId(req.session.user_id) };
    let impersonate = [];

    const result = await User.find(myquery).lean();
    const admindata = await User.find(query).lean();
    impersonate = { 'username': admindata[0].username, 'password': req.session.password };

    if (req.body.email != req.session.email) {
      if (result.length > 0) {
        req.session.email = result[0].email;
        req.session.username = result[0].username;
        req.session.photo = result[0].photo;
        req.session.user_id = result[0]._id;
        req.session.role = result[0].role;
        req.session.impersondata = impersonate;

        const myquery1 = { "id": req.body._id };
        const result1 = await GeneralSetting.find(myquery1).lean();
        const roledata = await Role.find({ "_id": result[0].role }).lean();

        const language = result1[0].language;
        res.cookie('locale', language, { maxAge: 900000, httpOnly: true });

        req.session.gen_id = result1[0]._id;
        req.session.company_logo = result1[0].company_logo;
        req.session.generaldata = result1[0];
        req.session.role_slug = roledata[0].role_slug;
        req.session.admin_access = roledata[0].admin_access;

        const date = Date(Date.now());
        const formatdate = moment(date, 'YYYY-MM-DD').format("YYYY-MM-DD");

        if (roledata[0].role_slug == 'admin' || roledata[0].role_slug == 'superadmin') {
          const query = { "date": formatdate, "status": 0 };
          const resulted = await EmiDetails.find(query).lean();

          resulted.forEach(async (element) => {
            const myquery = { "_id": element['_id'] };
            const newvalues = {
              $set: {
                status: 1,
              },
            };
            await EmiDetails.updateOne(myquery, newvalues).lean();
          });
        } else {
          const query = { "user_id": result[0]._id, "status": 1, "date": formatdate };
        }

        res.redirect('/dashboard');
      } else {
        req.flash('error', res.__('Invalid Email. You cannot impersonate this user.'));
        res.redirect("/impersonate/impersonateuser");
      }
    } else {
      req.flash('error', res.__('You cannot impersonate yourself.'));
      res.redirect("/impersonate/impersonateuser");
    }
  } catch (err) {
    throw err;
  }
};
