'use strict';
const express = require('express');
const router = express.Router();
const lang = require('../config/languageconfig');
const AccessRight = require('../models/AccessRights'); // Assuming you have a Mongoose model for AccessRight
const Role = require('../models/Role');

exports.getAccessRight = async (req, res) => {
  try {
    const languages = lang.getLocale();
    const query = { "status": 0 };

    const roles = await Role.find(query).lean();

    const access = await AccessRight.find({}).lean();

    const results = await Role.aggregate([
      {
        $lookup: {
          from: AccessRight.collection.collectionName,
          localField: 'role_slug',
          foreignField: 'rolename',
          as: 'role_db',
        },
      },
      { $unwind: '$role_db' },
      {
        $match: {
          $and: [{ status: 0 }]
        },
      },
    ]).exec();
    results.forEach((value, index) => {
      roles[index].dataofaccess = value.role_db;
    });

    res.render('accessrights/accessright', {
      title: "Access Rights",
      roledata: results,
      session: req.session,
      accessrightdata: access,
      setlang: languages,
      messages: req.flash()
    });
  } catch (err) {
    // Handle errors here
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

exports.postAccessRight = async (req, res) => {
  try {
    const id = req.body.id;
    const { role_name, accessrights } = req.body;
    
    if (id) {
      const myquery = { "rolename": req.body.role_name };
      const newvalues = {
        $set: {
          rolename: role_name,
          access_type: accessrights ? accessrights : null
        }
      };

      const dbo = await AccessRight.updateOne(myquery, newvalues);
      const accessdata = await AccessRight.find(myquery).lean();
      req.session.access_rights = accessdata[0].access_type;

      // if (req.session.access_rights != undefined) {
      //   if (req.session.access_rights.access != undefined || req.session.admin_access == 1) {
      //     res.redirect('/accessrights/accessright');
      //   } else {
      //     res.redirect('/dashboard');
      //   }
      // } else {
      //   res.redirect('/dashboard');
      // }
      const roleTab = `#${role_name}-tab`;
      req.flash('success', res.__('Access_Rights Updated Sucessfully.'));
      res.redirect(`/accessrights/accessright${roleTab}`)

    } else {
      const newAccess = {
        rolename: role_name,
        access_type: accessrights,
      };

      await AccessRight.create(newAccess);

      req.flash('success', res.__('Access_Rights Updated Sucessfully.'));
      res.redirect('/accessrights/accessright');
    }
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error occurred.');
    res.redirect('/accessrights/accessright');
  }
};