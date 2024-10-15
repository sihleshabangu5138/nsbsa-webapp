const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const AccessRights = require('../models/AccessRights');
const { default: mongoose } = require('mongoose');
const moment = require('moment');
const lang = require('../config/languageconfig');
const CustomField = require('../models/Customfields');
const CustomFieldMeta = require('../models/CustomFieldMeta');
const ActivityLog = require('../models/Activitylog');
const EmiDetails = require('../models/Emi_details');
const LoanDetails = require('../models/LoanDetails');
const Users = require('../models/User');
const NotificationTemplate = require('../models/Notificationtemplate');


exports.getReminderList = async (req, res, next) => {
  try {
    const myquery = { "rolename": req.session.role_slug };
    let access_data = [];

    const access = await AccessRights.find(myquery).lean();

    for (const [key, value] of Object.entries(access)) {
      for (const [key1, value1] of Object.entries(value['access_type'])) {
        if (key1 == "reminder") {
          access_data = value1;
        }
      }
    }

    res.render('reminder/reminders', { title: 'Reminders', session: req.session, messages: req.flash(), accessrightdata: access_data });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
exports.deleteReminder = function (req, res) {
  const id = req.params.id;

  const myquery = { "_id": new mongoose.Types.ObjectId(id) };
  Reminder.deleteOne(myquery, function (err, result) {
    if (err) {
      return next(err);
    } else {
      res.redirect('/role/rolelist');
    }
  });
};

// exports.getAddReminder = async (req, res) => {
//   const languages = lang.getLocale();
//   const id = req.params.id;
//   global.msg = 1;

//   try {
//     if (id) {
//       const myquery = { _id: new mongoose.Types.ObjectId(id) };
//       let result_data = await Reminder.find(myquery);

//       if (result_data.length > 0) {
//         result_data[0].id_d = new mongoose.Types.ObjectId(result_data[0].role).toString();
//         const query = { user_id: new mongoose.Types.ObjectId(id) };

//         const mydata = {
//           $and: [{ module_name: 'reminder' }, { field_visibility: 1 }],
//         };

//         const customfield = await CustomField.find(mydata);

//         for (let i = 0; i < customfield.length; i++) {
//           customfield[i].id_d = new mongoose.Types.ObjectId(customfield[i]._id).toString();
//         }

//         const myquery1 = { reference_id: new mongoose.Types.ObjectId(id) };
//         const customfield_value = await CustomFieldMeta.find(myquery1);

//         for (let i = 0; i < customfield_value.length; i++) {
//           customfield_value[i].id_d = new mongoose.Types.ObjectId(customfield_value[i].custom_field_id).toString();
//         }

//         res.render('reminder/addreminder', {
//           title: 'Edit Reminder',
//           data: result_data,
//           id: id,
//           session: req.session,
//           setlang: languages,
//           newfield: customfield,
//           customfield_value: customfield_value,
//         });
//       }
//     } else {
//       const news = [{ reminderdata: { '1': '1' } }];

//       const mydata = {
//         $and: [{ module_name: 'reminder' }, { field_visibility: 1 }],
//       };

//       const customfield = await CustomField.find(mydata);

//       res.render('reminder/addreminder', { title: 'Add Reminder', data: news, session: req.session, newfield: customfield });
//     }
//   } catch (err) {
//     // Handle errors here
//     console.error(err);
//     // Redirect or render an error page as appropriate.
//     res.status(500).send('Internal Server Error');
//   }
// };

exports.getAddReminder = async (req, res) => {
  const languages = lang.getLocale();
  const id = req.params.id;

  if (id) {
    try {
      const result_data = await Reminder.find({ "_id": new mongoose.Types.ObjectId(id) }).lean();
      const customfield = await CustomField.find({ "module_name": 'reminder', "field_visibility": "1" }).lean();
      const customfield_value = await CustomFieldMeta.find({ reference_id: new mongoose.Types.ObjectId(id) }).lean();

      result_data.id_d = new mongoose.Types.ObjectId(result_data.role).toString();

      for (const field of customfield) {
        field.id_d = new mongoose.Types.ObjectId(field._id).toString();
      }

      for (const field of customfield_value) {
        field.id_d = new mongoose.Types.ObjectId(field.custom_field_id).toString();
      }
      const notification = await NotificationTemplate.find().lean();

      res.render('reminder/addreminder', {
        title: 'Edit Reminder',
        data: result_data,
        id: id,
        session: req.session,
        setlang: languages,
        newfield: customfield,
        customfield_value: customfield_value,
        notification_tem: notification,
      });
      console.log(notification)
    } catch (err) {
      console.error(err);
      req.flash('error', res.__('Error occurred.'));
      res.redirect('/reminder/reminders');
    }
  } else {
    try {
      const notification = await NotificationTemplate.find().lean();
      const customfield = await CustomField.find({ module_name: 'reminder', field_visibility: 1 }).lean();
      res.render('reminder/addreminder', {
        title: 'Add Reminder',
        data: [{ reminderdata: { '1': '1' } }],
        session: req.session,
        newfield: customfield,
        notification_tem: notification,
      });
    } catch (err) {
      console.error(err);
      req.flash('error', res.__('Error occurred.'));
      res.redirect('/reminder/reminders');
    }
  }
}

exports.postAddReminder = async (req, res) => {
  const id = req.body.id;
  let data;

  if (req.body.reminderdata) {
    data = req.body.reminderdata.map((element) => ({
      number: element.number,
      recurense: element.recurense,
    }));
  } else {
    data = []; // or any other default value
  }

  if (id) {
    try {
      const myquery = { "_id": new mongoose.Types.ObjectId(id) };
      const newvalues = {
        $set: {
          reminder_nm: req.body.reminder_nm,
          reminder_template: req.body.reminder_template,
          reminder_desc: req.body.reminder_desc,
          reminder_will_send: req.body.reminder_will_send,
          reminder_type: req.body.reminder_type,
          reminderdata: data,
          addedby: new mongoose.Types.ObjectId(req.session.user_id),
        },
      };

      await Reminder.updateOne(myquery, newvalues);

      const date = Date(Date.now());
      const formatdate = moment(date).format('YYYY-MM-DD');
      const myobj = {
        date: formatdate,
        module: 'Reminder',
        action: 'updated',
        user: new mongoose.Types.ObjectId(req.session.user_id),
        item: req.body.reminder_nm,
        status: 0,
      };

      await ActivityLog.create(myobj);

      const metadata = await CustomFieldMeta.find({ "reference_id": new mongoose.Types.ObjectId(id) });

      if (metadata.length > 0) {
        // const date = Date.now();
        const formatdate = moment().format("YYYY-MM-DD");

        if (req.body.customfields) {
          for (const [keys, values] of Object.entries(metadata)) {
            const findquery = { "_id": values.custom_field_id };
            const finddata = await CustomField.find(findquery).lean();
            console.log('F : ', finddata);
            for (const [keysdata, valuesdata] of Object.entries(finddata)) {
              if (valuesdata.field_type == 'file') {
                for (const [key, value] of Object.entries(req.files)) {
                  const field = new mongoose.Types.ObjectId(values.custom_field_id).toString();
                  if (value.fieldname == field) {
                    const query1 = { "_id": values._id };
                    await CustomFieldMeta.deleteOne(query1);
                  }
                }
              } else {
                const query1 = { "_id": values._id };
                await CustomFieldMeta.deleteOne(query1);
              }
            }
          }
          for (const [keys1, values1] of Object.entries(req.body.customfields)) {
            const this_data = {
              custom_field_id: new mongoose.Types.ObjectId(keys1),
              customfield_value: values1,
              module: "reminder",
              user_id: new mongoose.Types.ObjectId(req.session.user_id),
              reference_id: new mongoose.Types.ObjectId(id),
              updated_at: formatdate,
            };
            await CustomFieldMeta.create(this_data);
          }
        }

        // Insert new file custom field metadata
        let m = 0;
        for (const [key, value] of Object.entries(req.files)) {
          for (const [keys, values] of Object.entries(metadata)) {
            const query1 = { "_id": values._id };
            const field = new mongoose.Types.ObjectId(values.custom_field_id).toString();
            if (value.fieldname == field) {
            } else {
              if (values._id) {
                m++;
              }
            }
          }
          if (m > 0) {
            const this_data = {
              custom_field_id: new mongoose.Types.ObjectId(value.fieldname),
              customfield_value: value.filename,
              module: "reminder",
              user_id: new mongoose.Types.ObjectId(req.session.user_id),
              reference_id: new mongoose.Types.ObjectId(id),
              updated_at: formatdate,
            };
            await CustomFieldMeta.create(this_data);
          }
        }
      } else {
        // const date = Date.now();
        const formatdate = moment().format("YYYY-MM-DD");

        // Insert new custom field metadata
        if (req.body.customfields) {
          for (const [key, value] of Object.entries(req.body.customfields)) {
            const this_data = {
              custom_field_id: new mongoose.Types.ObjectId(key),
              customfield_value: value,
              module: "reminder",
              user_id: new mongoose.Types.ObjectId(req.session.user_id),
              reference_id: new mongoose.Types.ObjectId(req.body.id),
              updated_at: formatdate,
            };
            await CustomFieldMeta.create(this_data);
          }
        }

        // Insert new file custom field metadata
        if (req.files) {
          for (const [key, file] of Object.entries(req.files)) {
            const this_data = {
              custom_field_id: new mongoose.Types.ObjectId(file.fieldname),
              customfield_value: file.filename,
              module: "reminder",
              user_id: new mongoose.Types.ObjectId(req.session.user_id),
              reference_id: new mongoose.Types.ObjectId(id),
              updated_at: formatdate,
            };
            await CustomFieldMeta.create(this_data);
          }
        }
      }

      req.flash('success', res.__('Reminder Updated Successfully.'));
      res.redirect('/reminder/reminders');
    } catch (error) {
      console.error(error);
      req.flash('error', res.__('Error occurred.'));
      res.redirect('/reminder/reminders');
    }
  } else {
    try {
      const myobj = {
        reminder_nm: req.body.reminder_nm,
        reminder_template: req.body.reminder_template,
        reminder_desc: req.body.reminder_desc,
        reminder_will_send: req.body.reminder_will_send,
        reminder_type: req.body.reminder_type,
        reminderdata: data,
        addedby: new mongoose.Types.ObjectId(req.session.user_id),
      };

      const result = await Reminder.create(myobj);
      const date = moment(Date.now()).format('YYYY-MM-DD');
      const myobj1 = {
        date,
        module: 'Reminder',
        action: 'inserted',
        user: new mongoose.Types.ObjectId(req.session.user_id),
        item: req.body.reminder_nm,
        status: 0,
      };

      await ActivityLog.create(myobj1);

      if (req.body.customfields) {
        for (const [key, value] of Object.entries(req.body.customfields)) {
          const this_data = {
            custom_field_id: new mongoose.Types.ObjectId(key),
            customfield_value: value,
            module: 'reminder',
            user_id: new mongoose.Types.ObjectId(req.session.user_id),
            reference_id: result._id,
            updated_at: date,
          };
          await CustomFieldMeta.create(this_data);
        }
      }
      if (req.files) {
        for (const [key, value] of Object.entries(req.files)) {
          const this_data = {
            custom_field_id: new mongoose.Types.ObjectId(value.fieldname),
            customfield_value: value.filename,
            module: 'reminder',
            user_id: new mongoose.Types.ObjectId(req.session.user_id),
            reference_id: result._id,
            updated_at: date,
          };
          await CustomFieldMeta.create(this_data);
        }
      }
      req.flash('success', res.__('Reminder Inserted Successfully.'));
      res.redirect('/reminder/reminders');
    } catch (error) {
      console.error(error);
      req.flash('error', res.__('Error occurred.'));
      res.redirect('/reminder/reminders');
    }
  }
};


exports.getReminderCuslist = async(req,res) => {
  try {
    const notificationtype = 'upcoming_emi';
    let alert_data = [];

    let emi_query;
    // if (req.session.access_rights.reminder.owndata) {
    //     emi_query.user_id =new mongoose.Types.ObjectId(req.session.user_id);
    // }
    if (req.session.access_rights && req.session.access_rights.reminder && req.session.access_rights.reminder.owndata) {
      emi_query = {
          status: 0,
          user_id:new mongoose.Types.ObjectId(req.session.user_id),
      };
  } else {
      emi_query = {
          status: 0,
      };
  }

    const reminder = await Reminder.find({ reminder_type: notificationtype }).lean();
    console.log(reminder);
        // const date = new Date();
        
        for (const [keys, values_n] of Object.entries(reminder)) {
          var befor_after = values_n.reminder_will_send;
          const reminder_template = values_n.reminder_template;

          for (const [keys, values1] of Object.entries(values_n.reminderdata)) {
              var number_day = values1.number;
          }
      }
      console.log(befor_after)
      console.log(number_day);
      let add_date;
      if (befor_after === 'Before') {
          add_date = moment().add(number_day, 'd');
      } else {
          add_date = moment().subtract(number_day, 'd');
      }
      add_date = moment(add_date).format('YYYY-MM-DD');
console.log(add_date)
        const result1 = await EmiDetails.aggregate([
            {
                $lookup: {
                    from: LoanDetails.collection.name,
                    localField: 'loan_id',
                    foreignField: '_id',
                    as: 'loan'
                }
            },
            {
                $unwind: '$loan'
            },
            {
                $lookup: {
                    from: Users.collection.name,
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $match: {
                    $and: [emi_query]
                }
            }
        ])
        console.log(result1)
        for (const [key1, value1] of Object.entries(result1)) {
          console.log("das:",value1)
          console.log("Values:", value1.loan.approvestatus, value1.loan.status, add_date);
          if (value1.loan.approvestatus == 1 || value1.loan.status == 0) {
            console.log("emi",value1.date)
              const date_of_emi = value1.date;
              console.log("add_date",add_date);
              console.log("date_of_emi",date_of_emi);
              if (add_date === date_of_emi) {
                  alert_data.push(value1);
                  console.log("Done Scene!")
              }
          }
      }

        res.render('reminder/reminders_customer', {
            title: 'Reminders',
            session: req.session,
            messages: req.flash(),
            alert_data: alert_data
        });
} catch (error) {
    console.error('Error in reminder:', error);
    res.status(500).send('Internal Server Error');
}
};

