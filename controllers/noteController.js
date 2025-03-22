'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const AccessRights = require('../models/AccessRights'); // Assuming you have a Mongoose model defined for 'Access_Rights'
const Note = require('../models/Notes');

exports.getNoteList = async (req, res) => {
  try {
    const myquery = { "rolename": req.session.role_slug };
    let access_data = [];

    const access = await AccessRights.find(myquery).lean();
    for (const [key, value] of Object.entries(access)) {
      for (const [key1, value1] of Object.entries(value['access_type'])) {
        if (key1 == 'notes') {
          access_data = value1;
        }
      }
    }

    res.render('notes/notelist', {
      title: 'Notes',
      session: req.session,
      messages: req.flash(),
      accessrightdata: access_data,
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'An error occurred.');
    res.redirect('/');
  }
}

exports.getViewNote = async (req, res) => {
  const id = req.params.id;

  if (id) {
    try {
      const note = await Note.find({ "_id": new mongoose.Types.ObjectId(id) }).lean();
      res.render('notes/viewnote', { title: 'View Note', data: note, id: id, session: req.session });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  } else {
    const news = [{ userid: '-1' }];
    res.render('notes/viewnote', { title: 'View Note', data: news, session: req.session, messages: req.flash() });
  }
};
