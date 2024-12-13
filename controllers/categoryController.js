'use strict';
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const CategoryTypes = require('../models/CategoryTypes');
const Category = require('../models/Category');
const ActivityLog = require('../models/Activitylog');
const AccessRights = require('../models/AccessRights');
const moment = require('moment');

exports.getCategoryList = async (req, res, next) => {

  try {

    let access_data = [];
    const access = await AccessRights.find({ "rolename": req.session.role_slug }).lean();

    for (const [key, value] of Object.entries(access)) {

      for (const [key1, value1] of Object.entries(value['access_type'])) {
        if (key1 == "category") {
          access_data = value1;
        }
      }
    };
    // console.log("cat:", access_data)
    res.render('category/categorylist', {
      title: 'Categories',
      session: req.session,
      messages: req.flash(),
      accessrightdata: access_data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

exports.getAddCategory = async (req, res) => {
  try {
    const id = req.params.id;

    if (id) {
      const myquery = { "_id": new mongoose.Types.ObjectId(id) };
      const result = await Category.find(myquery).lean();
      const cat_types = await CategoryTypes.find().lean();

      res.render('category/addcategory', { title: 'Edit Category', session: req.session, messages: req.flash(), data: result, types: cat_types });
    } else {
      const cat_types = await CategoryTypes.find().lean();
      const newCategory = { userid: '-1' };
      res.render('category/addcategory', {
        title: 'Add Category',
        data: newCategory,
        session: req.session,
        types: cat_types,
      });
    }
  } catch (err) {
    // Handle errors here
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}


exports.postAddCategory = async (req, res) => {
  const id = req.body.id;
  const formatdate = moment().format('YYYY-MM-DD');

  try {
    if (id) {
      const updatedCategory = {
        categorytypes: req.body.categorytypes,
        categoryname: req.body.categoryname,
        addedby: new mongoose.Types.ObjectId(req.session.user_id),
      };
      await Category.updateOne({ "_id": new mongoose.Types.ObjectId(id) }, updatedCategory);

      const myobj = {
        date: formatdate,
        module: 'Category',
        action: 'updated category',
        user: new mongoose.Types.ObjectId(req.session.user_id),
        item: req.body.categoryname,
        status: 0,
      };
      await ActivityLog.create(myobj);

      req.flash('success', res.__('Category Updated Successfully.'));
      res.redirect('/category/categorylist');
    } else {
      const newCategory = new Category({
        categorytypes: req.body.categorytypes,
        categoryname: req.body.categoryname,
        addedby: new mongoose.Types.ObjectId(req.session.user_id),
      });
      await newCategory.save()

      const myobj = {
        date: formatdate,
        module: 'Category',
        action: 'inserted category',
        user: new mongoose.Types.ObjectId(req.session.user_id),
        item: req.body.categoryname,
        status: 0,
      };
      await ActivityLog.create(myobj);

      req.flash('success', res.__('Category Added Successfully.'));
      res.redirect('/category/categorylist');
    }
  } catch (err) {
    req.flash('error', res.__('Error occurred.'));
    res.redirect('/category/categorylist');
  }
};



