const mongoose = require('mongoose');

const accessRightsSchema = new mongoose.Schema({
  rolename: {
    type: String,
    required: true,
    unique: true,
  },
  // access_type: {
  //   type: mongoose.Schema.Types.Mixed,
  //   required: true,
  // },
  access_type: {
    user: {
      view: String,
      add: String,
      update: String,
      delete: String,
      owndata: String,
    },
    deactiveuser: {
      view: String,
      add: String,
      update: String,
      delete: String,
      owndata: String,
    },
    typeofloan: {
      view: String,
      add: String,
      update: String,
      delete: String,
    },
    totalloanlist: {
      view: String,
      add: String,
      update: String,
      delete: String,
      owndata: String,
    },
    loanlist: {
      view: String,
      add: String,
      update: String,
      delete: String,
      owndata: String,
    },
    disapproveloanlist: {
      view: String,
      add: String,
      update: String,
      delete: String,
      owndata: String,
    },
    pendingemilist: {
      view: String,
      add: String,
      update: String,
      delete: String,
      owndata: String,
    },
    product: {
      view: String,
      add: String,
      update: String,
      delete: String,
      owndata: String,
    },
    rulesandregulation: {
      view: String,
      add: String,
      update: String,
      delete: String,
      owndata: String,
    },
    alert: {
      view: String,
      delete: String,
      owndata: String,
    },
    report: {
      view: String,
    },
    service: {
      view: String,
      add: String,
      update: String,
      delete: String,
      owndata: String,
    },
    category: {
      view: String,
      add: String,
      update: String,
      delete: String,
      owndata: String,
    },
    events: {
      view: String,
      add: String,
      update: String,
      delete: String,
      owndata: String,
    },
    notification: {
      view: String,
      add: String,
      update: String,
      delete: String,
      owndata: String,
    },
    notes: {
      view: String,
    },
    activitylog: {
      view: String,
    },
    reminder: {
      view: String,
      add: String,
      update: String,
      delete: String,
      owndata: String,
    },
  },
});

const AccessRights = mongoose.model('access_Rights', accessRightsSchema,'access_rights');

module.exports = AccessRights;
