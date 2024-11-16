'use strict';
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const lang = require('../config/languageconfig');
const mongoose = require('mongoose');

// Import Mongoose models
const User = require('../models/User');
const Role = require('../models/Role');
const GeneralSetting = require('../models/GeneralSetting');
const NotificationBadge = require('../models/Notification_badges');
const AccessRight = require('../models/AccessRights');
// db.once('open', () => {
exports.getLogin = async (req, res, next) => {
  const languages = lang.getLocale();
  if (req.session.username !== undefined) {
    res.redirect('/dashboard');
  } else {

    console.log(languages);
    res.render('login', {
      title: 'NiftyEWS',
      layout: 'loginlayout',
      session: req.session,
      message: req.flash(),
      setlang: languages,
    });
  }
};
exports.postLogin = async (req, res) => {
  try {

    // connectToDatabase();
    // if (mongoose.connection.readyState === 0) {
    //   // If the connection is not open, establish a new one
    //   connectToDatabase();
    //   console.log('Connected to the database with stored credentials');
    // }
    const myquery = { "username": req.body.username };
    const userResult = await User.find(myquery).lean();
    // console.log(userResult);
    if (userResult.length > 0) {
      const access = await roleaccess(userResult[0].role);

      if (access === 1 && userResult[0].status === 1) {
        const rest = await bcrypt.compare(req.body.password, userResult[0].password);

        if (rest && req.body.username === userResult[0].username) {
          req.session.email = userResult[0].email;
          req.session.username = userResult[0].username;
          req.session.password = req.body.password;
          req.session.photo = userResult[0].photo;
          req.session.user_id = userResult[0]._id;
          req.session.role = userResult[0].role;

          const noquery = { "user": new mongoose.Types.ObjectId(req.session.user_id), status: 1 };
          const query = { "user": new mongoose.Types.ObjectId(req.session.user_id), status: 1 };

          const generalSettingResult1 = await GeneralSetting.findOne({ "id": req.body._id });
          const roleData = await Role.findOne({ "_id": userResult[0].role });
          // console.log("roleData", roleData);
          // console.log("roleData", roleData.role_slug);
          const mysort = { date: -1 };
          const notiResult = await NotificationBadge.find(noquery).lean().sort(mysort);
          const adminNotiResult = await NotificationBadge.find({ status: 1 }).lean().sort(mysort);
          const activeNotiCount = await NotificationBadge.countDocuments(query);
          const adminNotiCount = await NotificationBadge.countDocuments({ status: 1 });
          console.log('notiresult', notiResult);
          console.log('adminnoti', adminNotiResult);

          const accessData = await AccessRight.find({ "rolename": roleData.role_slug }).lean()
          // console.log("accessData", accessData);
          const language = generalSettingResult1.language;
          res.cookie('locale', language, { maxAge: 900000, httpOnly: true });

          req.session.gen_id = generalSettingResult1._id;
          req.session.company_logo = generalSettingResult1.company_logo;
          req.session.generaldata = generalSettingResult1;
          req.session.role_slug = roleData.role_slug;
          req.session.admin_access = roleData.admin_access;
          // console.log("DAS:",accessData.length);
          if (accessData.length > 0) {
            req.session.access_rights = accessData[0].access_type;
          }
          // console.log("DAS:", req.session.access_rights);
          if (req.session.admin_access === 1) {
            req.session.noti = adminNotiResult;
            req.session.noticount = adminNotiCount;
          } else {
            req.session.noti = notiResult;
            req.session.noticount = activeNotiCount;
          }

          // const date = Date(Date.now());
          // const formatdate = moment(date).format("YYYY-MM-DD");
          //           const date = moment(); // Create a moment object with the current date and time
          // const formatdate = date.format(); 

          //           if (roleData.role_slug === 'admin' || roleData.role_slug === 'superadmin') {
          //             const resulted = await EmiDetail.find({ "date": formatdate, "status": 0 }).lean();

          //             for (const element of resulted) {
          //               const myquery = { "_id": element['_id'] };
          //               const newvalues = {
          //                 $set: {
          //                   status: 1,
          //                 }
          //               };

          //               await EmiDetail.updateOne(myquery, newvalues);
          //             }
          //           } else {
          //             const query = { "user_id": userResult[0]._id, "status": 1, "date": formatdate };
          //           }

          req.session.impersondata = '';
          res.redirect('/dashboard');
        } else {
          req.flash('error', res.__('You are not allowed to login. Enter correct username or password.'));
          
          res.render('login', { title: 'NiftyEWS', layout: "loginlayout" });
        }
      } else {
        req.flash('error', res.__('You are not allowed to login.'));
        res.render('login', { title: 'NiftyEWS', layout: "loginlayout" });
      }
    } else {
      req.flash('error', res.__('Invalid username or password.'));
      res.render('login', { title: 'NiftyEWS', layout: "loginlayout" });
      
    }
  } catch (error) {
    console.error(error);
    req.flash('error', res.__('An error occurred while processing your request.'));
    res.render('login', { title: 'NiftyEWS', layout: "loginlayout" });
  }
};

exports.getLogout = function (req, res) {
  req.session.destroy(function (err) {
    res.clearCookie('locale');
    res.redirect('/');
  });
};

async function roleaccess(role) {
  try {
    const myquery = { "_id": new mongoose.Types.ObjectId(role) };
    const result = await Role.find(myquery).lean();

    if (result.length > 0) {
      if (1 === result[0].allow_access) {
        return 1;
      } else {
        return 0;
      }
    }
  } catch (error) {
    console.error(error);
  }
}