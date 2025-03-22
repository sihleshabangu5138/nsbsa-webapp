const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const CustomField = require('../models/Customfields');
const AccessRights = require('../models/AccessRights');
const Reminder = require('../models/Reminder');
const ActivityLog = require('../models/Activitylog');
const moment = require('moment');

exports.getCustomFieldList = async (req, res, next) => {
  try {
    let access_data = [];
    const access = await AccessRights.find({ rolename: req.session.role_slug }).lean();

    for (const [key, value] of Object.entries(access)) {
      for (const [key1, value1] of Object.entries(value['access_type'])) {
        if (key1 == "customfield") {
          access_data = value1;
        }
      }
    }

    res.render('customfields/customfieldlist', {
      title: 'Custom Fields',
      session: req.session,
      messages: req.flash(),
      accessrightdata: access_data
    });
  } catch (err) {
    next(err);
  }
}
exports.getCustomFieldDelete = async (req, res, next) => {
  try {
    const id = req.params.id;
    await Reminder.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    res.redirect('/role/rolelist');
  } catch (err) {
    next(err);
  }
}

exports.getAddCustomField = async (req, res, next) => {
  const id = req.params.id;
  if (id) {
    const myquery = { "_id": new mongoose.Types.ObjectId(id) };
    const result = await CustomField.find(myquery).lean();
    console.log(result);
    res.render('customfields/addcustomfields', { title: "Edit Custom Field", data: result, id: id, session: req.session, messages: req.flash() });
  } else {
    const news = [{ userid: '-1' }];
    res.render('customfields/addcustomfields', { title: "Add Custom Field", data: news, id: id, session: req.session });
  }
}

exports.postAddCustomField = async function (req, res) {
  const id = req.body.id;
  const data = Array.isArray(req.body.validation) ? req.body.validation : [req.body.validation];
  const d_label = Array.isArray(req.body.d_label) ? req.body.d_label : [req.body.d_label];
  const c_label = Array.isArray(req.body.c_label) ? req.body.c_label : [req.body.c_label];
  const r_label = Array.isArray(req.body.r_label) ? req.body.r_label : [req.body.r_label];

  const isCheckboxChecked = req.body.field_visibility === '1';
  try {
    if (id) {
      const myquery = { "_id": new mongoose.Types.ObjectId(id) };
      const updatedCustomField = {
        module_name: req.body.module_name,
        label: req.body.label,
        field_type: req.body.field_type,
        validation: data,
        field_visibility: isCheckboxChecked ? 1 : 0,
        minival: req.body.minival,
        maxival: req.body.maxival,
        d_label: d_label,
        c_label: c_label.length > 0 ? c_label : undefined,
        r_label: r_label,
        filetype: req.body.filetype,
        filesize: req.body.filesize,
      };

      await CustomField.findByIdAndUpdate(myquery, updatedCustomField);
      const date = Date(Date.now());
      const formatdate = moment().format("YYYY-MM-DD");
      const activityLog = new ActivityLog({
        date: formatdate,
        module: "Custom Fields",
        action: "updated customfield in",
        user: new mongoose.Types.ObjectId(req.session.user_id),
        item: req.body.module_name,
        status: 0,
      });
      await activityLog.save();

      req.flash('success', res.__('Custom Field Updated Successfully.'));
      res.redirect('/customfields/customfieldlist');
    } else {
      const newCustomField = {
        module_name: req.body.module_name,
        label: req.body.label,
        field_type: req.body.field_type,
        validation: data,
        minival: req.body.minival,
        maxival: req.body.maxival,
        field_visibility: isCheckboxChecked ? 1 : 0,
        d_label: d_label,
        c_label: c_label.length > 0 ? c_label : undefined,
        r_label: r_label,
        filetype: req.body.filetype,
        filesize: req.body.filesize,
      };
      // if (c_label.length > 0) {
      //   newCustomField.c_label = c_label;
      // }
      console.log(isCheckboxChecked)
      const cdata = new CustomField(newCustomField);
      await cdata.save();
      const formatdate = moment().format("YYYY-MM-DD");
      const activityLog = new ActivityLog({
        date: formatdate,
        module: "Custom Fields",
        action: "inserted customfield in",
        user: new mongoose.Types.ObjectId(req.session.user_id),
        item: req.body.module_name,
        status: 0,
      });
      await activityLog.save();

      req.flash('success', res.__('Custom Field Added Successfully.'));
      res.redirect('/customfields/customfieldlist');
    }
  } catch (error) {
    req.flash('error', res.__('An error occurred.'));
    res.redirect('/customfields/customfieldlist');
  }
};