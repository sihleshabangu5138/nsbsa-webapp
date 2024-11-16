// controllers/eventController.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Event = require('../models/Events');
const Role = require('../models/Role');
const Category = require('../models/Category');
const AccessRights = require('../models/AccessRights');
const User = require('../models/User');
const ActivityLog = require('../models/Activitylog');
const NotificationTemplate = require('../models/Notificationtemplate');
const moment = require('moment');
const Mail = require('../config/email');

exports.getEventList = async (req, res, next) => {
  try {
    const myquery = { "rolename": req.session.role_slug };
    let access_data = [];
    const access = await AccessRights.find(myquery).lean();


    for (const [key, value] of Object.entries(access)) {

      for (const [key1, value1] of Object.entries(value['access_type'])) {
        if (key1 == "events") {
          access_data = value1;
        }
      }
    };

    res.render('events/eventlist', { title: 'Events', session: req.session, messages: req.flash(), accessrightdata: access_data });
  } catch (err) {
    console.error(err);
    // Handle any errors and send an error response if necessary
  }
}

exports.getAddEvent = async (req, res) => {
  // const languages = lang.getLocale();
  const id = req.params.id;

  try {
    if (id) {
      const myquery = { "_id": new mongoose.Types.ObjectId(id) };
      const query = { "categorytypes": "event" };
      const rolequery = { "status": 0 };

      const category = await Category.find(query).lean();
      const events = await Event.find(myquery).lean();
      if (events[0].eventfor != "all") {
        for (const [key, value] of Object.entries(events)) {
          events[key].eventforid_d = new mongoose.Types.ObjectId(value.eventfor).toString();
        }
      }
      const roles = await Role.find(rolequery).lean();

      for (const role of roles) {
        role.id_d = new mongoose.Types.ObjectId(role._id).toString();
      }

      res.render('events/addevent', {
        title: 'Edit event',
        session: req.session,
        messages: req.flash(),
        data: events,
        type: category,
        role: roles
      });
    } else {
      const categories = await Category.find({ categorytypes: 'event' }).lean();
      const roles = await Role.find({ status: 0 }).lean();
      const news = [{ 'userid': '-1' }];
      res.render('events/addevent', { title: 'Add event', session: req.session, messages: req.flash(), data: news, type: categories, role: roles });

    }
  } catch (error) {
    req.flash('error', res.__('Error occurred.'));
    res.redirect('/events/eventlist');
  }
};


exports.postAddEvent = async function (req, res) {
  try {
    const id = req.body.id;
    if (id) {
      const myquery = { "_id": new mongoose.Types.ObjectId(id) };
      const {
        eventtype,
        eventtitle,
        eventvenue,
        duration,
        startdate,
        enddate,
        eventfor,
        eventdetail,
      } = req.body;
      let newvalues;
      if (req.body.duration === "one day") {
        newvalues = {
          eventtype,
          eventtitle,
          eventvenue,
          duration,
          startdate,
          eventfor: (eventfor === 'all') ? 'all' : new mongoose.Types.ObjectId(eventfor),
          eventdetail,
          addedby: new mongoose.Types.ObjectId(req.session.user_id),
          $unset: { enddate: 1 },
        };
      } else {
        newvalues = {
          eventtype,
          eventtitle,
          eventvenue,
          duration,
          startdate,
          enddate,
          eventfor: (eventfor === 'all') ? 'all' : new mongoose.Types.ObjectId(eventfor),
          eventdetail,
          addedby: new mongoose.Types.ObjectId(req.session.user_id),
        };
      }
      await Event.updateOne(myquery, newvalues);

      if (eventfor === "all") {
        const queries = { "status": 1 };
        const useresult = await User.find(queries).lean();
        if (req.body.duration === "one day") {
          const notification = await NotificationTemplate.find({ templatetitle: "one day event updated" });
          for (const [key, value] of Object.entries(notification)) {
            for (const [key1, value1] of Object.entries(useresult)) {
              const message = value.content;
              const subject = value.subject;
              const Obj = {
                '_USERFIRSTNAME_': value1.firstname,
                '_USERLASTNAME_': value1.lastname,
                '_EVENTDURATION_': req.body.duration,
                '_EVENTSTARTDATE_': req.body.startdate,
                '_EVENTENDDATE_': req.body.enddate,
                '_EVENTNAME_': req.body.eventtitle,
                '_EVENTVENUE_': req.body.eventvenue,
                '_newline_': '<br>',
                '_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
                '_systemname_': req.session.generaldata.com_name,
              };
              const trans = message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
                return Obj[matched];
              });
              const subtrans = subject.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
                return Obj[matched];
              });
              Mail.sendMail(value1.email, subtrans, trans);
            }
          }
        } else {
          const notification = await NotificationTemplate.find({ templatetitle: "multiple day event updated" }).lean();
          for (const [key, value] of Object.entries(notification)) {
            for (const [key1, value1] of Object.entries(useresult)) {
              const message = value.content;
              const subject = value.subject;
              const Obj = {
                '_USERFIRSTNAME_': value1.firstname,
                '_USERLASTNAME_': value1.lastname,
                '_EVENTDURATION_': req.body.duration,
                '_EVENTSTARTDATE_': req.body.startdate,
                '_EVENTENDDATE_': req.body.enddate,
                '_EVENTNAME_': req.body.eventtitle,
                '_EVENTVENUE_': req.body.eventvenue,
                '_newline_': '<br>',
                '_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
                '_systemname_': req.session.generaldata.com_name,
              };
              const trans = message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
                return Obj[matched];
              });
              const subtrans = subject.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
                return Obj[matched];
              });
              Mail.sendMail(value1.email, subtrans, trans);
            }
          }
        }
      }
      else {
        const mailquery = { $and: [{ "role": new mongoose.Types.ObjectId(req.body.eventfor) }, { "status": 1 }] };
        const useresult = await User.find(mailquery).lean();
        console.log(useresult);
        if (req.body.duration === "one day") {
          const notification = await NotificationTemplate.find({ templatetitle: "one day event updated" }).lean();
          for (const [key, value] of Object.entries(notification)) {
            for (const [key1, value1] of Object.entries(useresult)) {
              const message = value.content;
              const subject = value.subject;
              const Obj = {
                '_USERFIRSTNAME_': value1.firstname,
                '_USERLASTNAME_': value1.lastname,
                '_EVENTDURATION_': req.body.duration,
                '_EVENTSTARTDATE_': req.body.startdate,
                '_EVENTENDDATE_': req.body.enddate,
                '_EVENTNAME_': req.body.eventtitle,
                '_EVENTVENUE_': req.body.eventvenue,
                '_newline_': '<br>',
                '_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
                '_systemname_': req.session.generaldata.com_name,
              };
              const trans = message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
                return Obj[matched];
              });
              const subtrans = subject.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
                return Obj[matched];
              });
              Mail.sendMail(value1.email, subtrans, trans);
            }
          }
        } else {
          const notification = await NotificationTemplate.find({ templatetitle: "multiple day event updated" }).lean();
          for (const [key, value] of Object.entries(notification)) {
            for (const [key1, value1] of Object.entries(useresult)) {
              const message = value.content;
              const subject = value.subject;
              const Obj = {
                '_USERFIRSTNAME_': value1.firstname,
                '_USERLASTNAME_': value1.lastname,
                '_EVENTDURATION_': req.body.duration,
                '_EVENTSTARTDATE_': req.body.startdate,
                '_EVENTENDDATE_': req.body.enddate,
                '_EVENTNAME_': req.body.eventtitle,
                '_EVENTVENUE_': req.body.eventvenue,
                '_newline_': '<br>',
                '_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
                '_systemname_': req.session.generaldata.com_name,
              };
              const trans = message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
                return Obj[matched];
              });
              const subtrans = subject.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
                return Obj[matched];
              });
              Mail.sendMail(value1.email, subtrans, trans);
            }
          }
        }
      }

      const date1 = moment().format('YYYY-MM-DD');
      const myobjs = {
        date: date1,
        module: "Event",
        action: "updated event",
        user: new mongoose.Types.ObjectId(req.session.user_id),
        item: req.body.eventtitle,
        status: 0,
      };
      await ActivityLog.create(myobjs);
      req.flash('success', res.__('Event Updated Successfully.'));
      res.redirect('/events/eventlist');
    } else {
      const {
        eventtype,
        eventtitle,
        eventvenue,
        duration,
        startdate,
        enddate,
        eventfor,
        eventdetail,
      } = req.body;

      const eventObj = {
        eventtype,
        eventtitle,
        eventvenue,
        duration,
        startdate,
        enddate: (!enddate ) ? enddate=startdate : enddate,
        eventfor: (eventfor === 'all') ? 'all' : new mongoose.Types.ObjectId(eventfor),
        eventdetail,
        addedby: new mongoose.Types.ObjectId(req.session.user_id),
      };
      const newEvent =
        await Event.create(eventObj);
      console.log(newEvent);

      // const date = Date(Date.now());
      // const formatdate = moment(date,'YYYY-MM-DD').format("YYYY-MM-DD");
      const date1 = moment().format('YYYY-MM-DD');
      const myobj1 = {
        date: date1,
        module: "Event",
        action: "inserted event",
        user: new mongoose.Types.ObjectId(req.session.user_id),
        item: req.body.eventtitle,
        status: 0,
      };
      await ActivityLog.create(myobj1);

      if (eventfor === "all") {
        console.log(eventfor);
        const queries = { "status": 1 };
        const useresult = await User.find(queries).lean();
        console.log("useresult", useresult);
        if (req.body.duration === "one day") {
          console.log("one day", req.body.duration);
          const notification = await NotificationTemplate.find({ templatetitle: "One day Event Added" }).lean();
          for (const [key, value] of Object.entries(notification)) {
            console.log("value", value)
            for (const [key1, value1] of Object.entries(useresult)) {
              console.log("value1", value1);
              const message = value.content;
              const subject = value.subject;
              const Obj = {
                '_USERFIRSTNAME_': value1.firstname,
                '_USERLASTNAME_': value1.lastname,
                '_EVENTDURATION_': req.body.duration,
                '_EVENTSTARTDATE_': req.body.startdate,
                '_EVENTENDDATE_': req.body.enddate,
                '_EVENTNAME_': req.body.eventtitle,
                '_EVENTVENUE_': req.body.eventvenue,
                '_newline_': '<br>',
                '_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
                '_systemname_': req.session.generaldata.com_name,
              };
              const trans = message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
                return Obj[matched];
              });
              const subtrans = subject.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
                return Obj[matched];
              });
              console.log("trans", trans);
              console.log("subtrans", subtrans);
              Mail.sendMail(value1.email, subtrans, trans);

            }
          }
        } else {
          const notification = await NotificationTemplate.find({ templatetitle: "Multiple days Event Added" }).lean();
          for (const [key, value] of Object.entries(notification)) {
            for (const [key1, value1] of Object.entries(useresult)) {
              const message = value.content;
              const subject = value.subject;
              const Obj = {
                '_USERFIRSTNAME_': value1.firstname,
                '_USERLASTNAME_': value1.lastname,
                '_EVENTDURATION_': req.body.duration,
                '_EVENTSTARTDATE_': req.body.startdate,
                '_EVENTENDDATE_': req.body.enddate,
                '_EVENTNAME_': req.body.eventtitle,
                '_EVENTVENUE_': req.body.eventvenue,
                '_newline_': '<br>',
                '_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
                '_systemname_': req.session.generaldata.com_name,
              };
              const trans = message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
                return Obj[matched];
              });
              const subtrans = subject.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
                return Obj[matched];
              });
              Mail.sendMail(value1.email, subtrans, trans);
            }
          }
        }
      } else {
        console.log(eventfor);
        const mailquery = { $and: [{ "role": new mongoose.Types.ObjectId(req.body.eventfor) }, { "status": 1 }] };
        const useresult = await User.find(mailquery).lean();
        console.log("useresult", useresult);
        if (req.body.duration === "one day") {
          console.log("one day", req.body.duration);
          const notification = await NotificationTemplate.find({ templatetitle: "One day Event Added" }).lean();
          for (const [key, value] of Object.entries(notification)) {
            console.log("value", value)
            for (const [key1, value1] of Object.entries(useresult)) {
              console.log("value1", value1);
              const message = value.content;
              const subject = value.subject;
              const Obj = {
                '_USERFIRSTNAME_': value1.firstname,
                '_USERLASTNAME_': value1.lastname,
                '_EVENTDURATION_': req.body.duration,
                '_EVENTSTARTDATE_': req.body.startdate,
                '_EVENTENDDATE_': req.body.enddate,
                '_EVENTNAME_': req.body.eventtitle,
                '_EVENTVENUE_': req.body.eventvenue,
                '_newline_': '<br>',
                '_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
                '_systemname_': req.session.generaldata.com_name,
              };
              const trans = message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
                return Obj[matched];
              });
              const subtrans = subject.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
                return Obj[matched];
              });
              console.log("trans", trans);
              console.log("subtrans", subtrans);
              Mail.sendMail(value1.email, subtrans, trans);
            }
          }
        } else {
          const notification = await NotificationTemplate.find({ templatetitle: "Multiple days Event Added" }).lean();
          for (const [key, value] of Object.entries(notification)) {
            for (const [key1, value1] of Object.entries(useresult)) {
              const message = value.content;
              const subject = value.subject;
              const Obj = {
                '_USERFIRSTNAME_': value1.firstname,
                '_USERLASTNAME_': value1.lastname,
                '_EVENTDURATION_': req.body.duration,
                '_EVENTSTARTDATE_': req.body.startdate,
                '_EVENTENDDATE_': req.body.enddate,
                '_EVENTNAME_': req.body.eventtitle,
                '_EVENTVENUE_': req.body.eventvenue,
                '_newline_': '<br>',
                '_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
                '_systemname_': req.session.generaldata.com_name,
              };
              const trans = message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
                return Obj[matched];
              });
              const subtrans = subject.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function (matched) {
                return Obj[matched];
              });
              console.log("trans", trans);
              console.log("subtrans", subtrans);
              Mail.sendMail(value1.email, subtrans, trans);
            }
          }
        }
      }

      req.flash('success', res.__('Event Inserted Successfully.'));
      res.redirect('/events/eventlist');
    }
  } catch (err) {
    req.flash('error', res.__('Error occurred.'));
    res.redirect('/events/eventlist');
  }
}

exports.getEventView = async function (req, res) {
  try {
    const id = req.params.id;

    if (id) {
      const event = await Event.find({ _id: new mongoose.Types.ObjectId(id) }).lean();
      res.render('events/viewevent', { title: "View Event", data: event, id: id, session: req.session });
    } else {
      const news = [{ 'userid': '-1' }];
      res.render('events/viewevent', { title: 'View Event', data: news, session: req.session, messages: req.flash() });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}