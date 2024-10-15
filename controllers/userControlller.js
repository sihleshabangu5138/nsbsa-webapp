'use strict';
const express = require('express');
const router = express.Router();
const md5 = require('md5');
const fs = require('fs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
const FamilyData = require('../models/Familydata');
const GenralSettings = require('../models/GeneralSetting');
const Customfields = require('../models/Customfields');
const CustomFieldMeta = require('../models/CustomFieldMeta');
const NotificationTemplate = require('../models/Notificationtemplate');
const ActivityLog = require('../models/Activitylog');
// const { validationResult } = require('express-validator');
const https = require('https');
const NotificationBadges = require('../models/Notification_badges');
const AccessRights = require('../models/AccessRights');
const lang = require('../config/languageconfig');
const Mail = require('../config/email');
const moment = require('moment');
const bcrypt = require('bcrypt');
// router.use(lang.init)

exports.getEditUser = async (req, res) => {
  const id = req.params.id;
  global.msg = 1;

  if (id) {
    try {
      console.log("role_session",req.session.role)
      let result_data = [];
      const result = await User.find({ "_id": new mongoose.Types.ObjectId(id) }).lean();
      // const result_data = await User.find({"_id":new mongoose.Types.ObjectId(id)}).lean();
      result_data = result;
      result_data[0].id_d = new mongoose.Types.ObjectId(result[0].role).toString();

      console.log("result_data:",result_data[0].id_d)
      const role_name = await Role.find({}).lean();
      for (const [key, value] of Object.entries(role_name)) {
        role_name[key].id_d = new mongoose.Types.ObjectId(value._id).toString();
        console.log("role_name:",role_name[key].id_d);
      };
      console.log("role_name1:",result[0].role);
      const settings = await Generalsetting.find().lean();
      const jsonData = fs.readFileSync('public/data/countries.json', 'utf8');
      const jsonParsed = JSON.parse(jsonData);

      res.render('users/editprofile', {
        title: "Edit Profile",
        data: result_data,
        id: id,
        role: role_name,
        session: req.session,
        country: jsonParsed.countries,
        setting: settings,
      });
      console.log("id", id)

    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  } else {
    try {
      const role_name = await Role.find().lean();
      const jsonData = fs.readFileSync('public/data/countries.json', 'utf8');
      const jsonParsed = JSON.parse(jsonData);
      const news = [{ 'userid': '-1' }];
      res.render('users/adduser', {
        title: "Add User",
        data: news,
        role: role_name,
        session: req.session,
        country: jsonParsed.countries,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  }
};

// POST route
exports.postEditUser = async function (req, res) {
  const id = req.body.id;
  global.msg = 1
  if (id) {
    console.log(req.session.role)
    const myquery = { "_id": new mongoose.Types.ObjectId(id) };
    let photo = req.body.photo_old;
    let pass = req.body.password_old;
    let roleid = req.body.role;
    console.log("roleid", roleid);
    let idrole = new mongoose.Types.ObjectId(roleid);
    console.log("idrole", idrole);

    if (req.file != undefined) {
      photo = req.file.filename;
    }
    

    if (req.body.password != '') {
      pass = md5(req.body.password);
    }

    const newvalues = {
      $set: {
        firstname: req.body.firstname,
        middlename: req.body.middlename,
        lastname: req.body.lastname,
        email: req.body.email,
        photo: photo,
        ccode: req.body.ccode,
        mobile: req.body.mobile,
        occupation: req.body.occupation,
        birthdate: req.body.birthdate,
        gender: req.body.gender,
        username: req.body.username,
        // role: idrole,
        ...(req.body.password !== '' && { password: pass }),
        address: req.body.address,
        country: parseInt(req.body.country, 10),
        state: parseInt(req.body.state, 10),
        city: parseInt(req.body.city, 10),
        pincode: req.body.pincode,
        status: 1,
      }
    };

    try {
      await User.findByIdAndUpdate(myquery, newvalues);
      req.session.email = req.body.email;
      req.session.username = req.body.username;
      req.session.photo = photo;
      // req.session.role = idrole;
      req.flash('success', res.__('User Updated Successfully.'));
      res.redirect('/dashboard');
    } catch (err) {
      console.error(err);
      req.flash('error', res.__('Error occurred.'));
      res.redirect('/dashboard');
    }
  } else {
    const pass = md5(req.body.password);
    // const pass1 = md5(req.body.confirmpassword);
    const roleid = req.body.role;
    const idrole = new mongoose.Types.ObjectId(roleid);

    const myobj = {
      firstname: req.body.firstname,
      middlename: req.body.middlename,
      lastname: req.body.lastname,
      email: req.body.email,
      photo: req.file.filename,
      ccode: req.body.ccode,
      mobile: req.body.mobile,
      occupation: req.body.occupation,
      birthdate: req.body.birthdate,
      gender: req.body.gender,
      username: req.body.username,
      // role: idrole,
      password: pass,
      address: req.body.address,
      country: parseInt(req.body.country, 10),
      state: parseInt(req.body.state, 10),
      city: parseInt(req.body.city, 10),
      pincode: req.body.pincode,
      status: 1,
    };

    try {
      await User.create(myobj);
      req.session.email = req.body.email;
      req.session.username = req.body.username;
      req.session.photo = photo;
      // req.session.role = idrole;
      req.flash('success', res.__('User Inserted Successfully.'));
      res.redirect('/dashboard');
    } catch (err) {
      console.error(err);
      req.flash('error', res.__('Error occurred.'));
      res.redirect('/dashboard');
    }
  }
}


exports.getAddUser = async function (req, res) {

  try {
    const languages = lang.getLocale();
    const id = req.params.id;
    global.msg = 1;
    console.log(languages)
    if (id) {
      let result_data = [];
      const result = await User.find({ "_id": new mongoose.Types.ObjectId(id) }).lean();
      result_data = result;
      result_data[0].id_d = new mongoose.Types.ObjectId(result[0].role).toString();

      const familyData = await FamilyData.find({ "user_id": new mongoose.Types.ObjectId(id) }).lean();
      if (familyData) {
        familyData.id_d = new mongoose.Types.ObjectId(familyData._id).toString();
      }

      const role_name = await Role.find({}).lean();
      for (const [key, value] of Object.entries(role_name)) {
        role_name[key].id_d = new mongoose.Types.ObjectId(value._id).toString();
      };
      const countriesData = fs.readFileSync('public/data/countries.json');
      const countries = JSON.parse(countriesData);


      const settings = await Generalsetting.find({}).lean();
      const mydata = { $and: [{ "module_name": "user" }, { "field_visibility": 1 }] };
      const customfield = await Customfields.find(mydata).lean();
      for (const [key, value] of Object.entries(customfield)) {
        customfield.forEach(element => {
          customfield[key].id_d = new mongoose.Types.ObjectId(value._id).toString();
        });
      };

      const myquery1 = { "reference_id": new mongoose.Types.ObjectId(id) };
      const customfield_value = await CustomFieldMeta.find(myquery1).lean();

      for (const [key, value] of Object.entries(customfield_value)) {
        customfield_value[key].id_d = new mongoose.Types.ObjectId(value.custom_field_id).toString();
      };

      res.render('users/adduser', {
        title: "Edit User",
        data: result,
        id: id,
        role: role_name,
        family: familyData,
        session: req.session,
        country: countries.countries,
        setting: settings,
        setlang: languages,
        newfield: customfield,
        customfield_value: customfield_value
      });
      console.log("id", id)
      console.log('result_data', result);
      console.log('role_name', role_name);
      console.log('family_data', familyData);
      console.log('setting', settings);
      console.log('customfield', customfield);
      console.log('customfield_value', customfield_value);

    } else {
      const roleNames = await Role.find({}).lean();
      const settings = await GenralSettings.find({}).lean();
      const customFields = await Customfields.find({ $and: [{ "module_name": "user" }, { "field_visibility": 1 }] }).lean();

      const news = [{ 'userid': '-1' }];
      const jsonData = fs.readFileSync('public/data/countries.json', 'utf8');
      const jsonParsed = JSON.parse(jsonData);
      res.render('users/adduser', {
        title: "Add User",
        data: news,
        role: roleNames,
        family: news,
        session: req.session,
        country: jsonParsed.countries,
        setting: settings,
        newfield: customFields
      });
      console.log("Names", customFields)

    }
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
};


exports.postAddUser = async (req, res) => {
  try {
    const id = req.body.id;
    // let pass;
    // let roleid;
    // let birthdate;
    // let newvalues;

    if (id) {
      for (const [key, value] of Object.entries(req.files)) {
        if (value.fieldname == "photo") {
          var img = value.filename;
        }
      }
      const {
        firstname,
        middlename,
        lastname,
        email,
        ccode,
        mobile,
        occupation,
        gender,
        username,
        password,
        address,
        country,
        state,
        city,
        pincode,
        accountnumber,
        pannumber,
        customfields,
        family,
      } = req.body;
      const { files } = req;
      const user = await User.findById({ "_id": new mongoose.Types.ObjectId(id) }).lean();


      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }


      const pass = password ? await bcrypt.hash(password, 10) : undefined;

      const roleid = new mongoose.Types.ObjectId(req.body.role);


      const birthdate = moment(req.body.birthdate).format("YYYY-MM-DD");

      const newValues = {
        firstname,
        middlename,
        lastname,
        email,
        photo: img,
        ccode,
        mobile,
        occupation,
        birthdate: birthdate,
        gender,
        username,
        role: roleid,
        password: pass,
        address,
        country: parseInt(country, 10),
        state: parseInt(state, 10),
        city: parseInt(city, 10),
        pincode,
        accountnumber,
        pannumber,
        status: 1,
        updatedby: new mongoose.Types.ObjectId(req.session.user_id),
      };
      if (pass) {
        newValues.password = pass;
      }
      console.log('newValues', newValues);
      const result = await User.findByIdAndUpdate({ "_id": new mongoose.Types.ObjectId(id) }, newValues);

      const date = moment().format('YYYY-MM-DD');

      const notificationTemplates = await NotificationTemplate.find({ templatetitle: 'user profile updated' });

      for (const notification of notificationTemplates) {
        const message = notification.content;
        const subject = notification.subject;

        const Obj = {
          '_USERFIRSTNAME_': firstname,
          '_USERLASTNAME_': lastname,
          '_DATETIME_': date,
          '_newline_': '<br>',
          '_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
          '_systemname_': req.session.generaldata.com_name,
        };

        const trans = message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_newline_|_tab_|_systemname_|_DATETIME_/gi, (matched) => {
          return Obj[matched];
        });

        const subtrans = subject.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_newline_|_tab_|_systemname_|_DATETIME_/gi, (matched) => {
          return Obj[matched];
        });

        Mail.sendMail(email, subtrans, trans);
      }

      const activityLog = {
        date,
        module: 'User',
        action: 'updated user named',
        user: new mongoose.Types.ObjectId(req.session.user_id),
        item: username,
        status: 0,
      };

      await ActivityLog.create(activityLog);

      const metadata = await CustomFieldMeta.find({ "reference_id": new mongoose.Types.ObjectId(id) });

      if (metadata.length > 0) {
        // const date = new Date();
        const formatdate = moment().format("YYYY-MM-DD");

        if (req.body.customfields) {
          for (const [keys, values] of Object.entries(metadata)) {
            const findquery = { "_id": values.custom_field_id };
            const finddata = await Customfields.find(findquery).lean();

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
              module: "user",
              user_id: new mongoose.Types.ObjectId(req.session.user_id),
              reference_id: new mongoose.Types.ObjectId(id),
              updated_at: formatdate,
            };
            await CustomFieldMeta.create(this_data);
          }
        }
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
              module: "user",
              user_id: new mongoose.Types.ObjectId(req.session.user_id),
              reference_id: new mongoose.Types.ObjectId(id),
              updated_at: formatdate,
            };
            await CustomFieldMeta.create(this_data);
          }
        }
      } else {
        // const date = new Date();
        const formatdate = moment().format("YYYY-MM-DD");

        if (req.body.customfields) {
          for (const [key, value] of Object.entries(req.body.customfields)) {
            const this_data = {
              custom_field_id: new mongoose.Types.ObjectId(key),
              customfield_value: value,
              module: "user",
              user_id: new mongoose.Types.ObjectId(req.session.user_id),
              reference_id: new mongoose.Types.ObjectId(id),
              updated_at: formatdate,
            };
            await CustomFieldMeta.create(this_data);
          }
        }

        if (req.files) {
          for (const [key, value] of Object.entries(req.files)) {
            if (value.fieldname == "photo") {
              // Do something with the photo file
            } else {
              const this_data = {
                custom_field_id: new mongoose.Types.ObjectId(value.fieldname),
                customfield_value: value.filename,
                module: "user",
                user_id: new mongoose.Types.ObjectId(req.session.user_id),
                reference_id: new mongoose.Types.ObjectId(id),
                updated_at: formatdate,
              };
              await CustomFieldMeta.create(this_data);
            }
          }
        }
      }

      if (family) {
        for (const [key, value] of Object.entries(family)) {
          if (value.id !== '') {
            const myquery1 = { "_id": new mongoose.Types.ObjectId(value.id) };
            const newval = {
              $set: {
                familymember: value.familymember,
                relationship: value.relationship,
                famoccupation: value.famoccupation,
                famcontact: value.famcontact,
                income: value.income,
              },
            };

            await FamilyData.updateOne(myquery1, newval);
          } else {
            const thisData = {
              user_id: result._id,
              familymember: value.familymember,
              relationship: value.relationship,
              famoccupation: value.famoccupation,
              famcontact: value.famcontact,
              income: value.income,
            };

            await FamilyData.create(thisData);
          }
        }
      }

      const formatdate = moment().format('YYYY-MM-DD');
      const useresult = await User.findById(id);

      const myobj = {
        action: 'User Updated',
        desc: 'is updated',
        user: new mongoose.Types.ObjectId(id),
        Name: username,
        date: formatdate,
        status: useresult.status,
      };

      await NotificationBadges.create(myobj);

      const noquery = { user: new mongoose.Types.ObjectId(req.session.user_id) };
      const query1 = { $and: [{ status: 1 }, { user: new mongoose.Types.ObjectId(req.session.user_id) }] };

      const notiresult = await NotificationBadges.find(noquery);
      const adminnoti = await NotificationBadges.find();
      const activenoti = await NotificationBadges.countDocuments(query1);
      const adminnoticount = await NotificationBadges.countDocuments();

      if (req.session.admin_access === 1) {
        req.session.noti = adminnoti;
        req.session.noticount = adminnoticount;
      } else {
        req.session.noti = notiresult;
        req.session.noticount = activenoti;
      }

      if (!result) {
        req.flash('error', res.__('Error occurred. User not found.'));
        res.redirect('/users/userlist');
      } else {
        req.flash('success', res.__('User Updated Successfully.'));
        res.redirect('/users/userlist');
      }

    } else {


      for (const [key, value] of Object.entries(req.files)) {
        if (value.fieldname == "photo") {
          var img = value.filename;
        }
      }
      if(img == undefined){
        img = "default.png";
      }
      const { firstname, middlename, lastname, email, ccode, mobile, occupation, gender, username, password, address, country, state, city, pincode, accountnumber, pannumber, status, family, customfields } = req.body;
      const { files } = req;

      // Find the role by id
      console.log(req.body.role)
      const roleid = new mongoose.Types.ObjectId(req.body.role);
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Format the birthdate
      const birthdate = moment(req.body.birthdate).format("YYYY-MM-DD");

      // Create the user object
      const user = new User({
        firstname,
        middlename,
        lastname,
        email,
        photo: img,
        ccode,
        mobile,
        occupation,
        birthdate: birthdate,
        gender,
        username,
        role: roleid,
        password: hashedPassword,
        address,
        country: parseInt(country, 10),
        state: parseInt(state, 10),
        city: parseInt(city, 10),
        pincode,
        accountnumber,
        pannumber,
        status: 1,
        addedby: new mongoose.Types.ObjectId(req.session.user_id),
      });

      // Save the user to the database
      const savedUser = await user.save();

      // Log the activity
      const activityLog = new ActivityLog({
        date: moment().format("YYYY-MM-DD"),
        module: "User",
        action: "inserted user named",
        user: new mongoose.Types.ObjectId(req.session.user_id),
        item: username,
        status: 0
      });
      await activityLog.save();

      // Send notification email
      const roles = await Role.findOne({"_id": roleid});
      const notificationTemplates = await NotificationTemplate.find({ templatetitle: "Added User" });
      for (const notification of notificationTemplates) {
        const message = notification.content;
        const subject = notification.subject;
        const replacements = {
          '_USERFIRSTNAME_': firstname,
          '_USERLASTNAME_': lastname,
          '_ROLENAME_': roles.role_nm,
          '_username_': username,
          '_password_': password,
          '_newline_': '<br>',
          '_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
          '_systemname_': req.session.generaldata.com_name,
        };
        const transformedMessage = message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_ROLENAME_|_newline_|_tab_|_systemname_|_username_|_password_/gi, matched => replacements[matched]);
        const transformedSubject = subject.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_ROLENAME_|_newline_|_tab_|_systemname_|_username_|_password_/gi, matched => replacements[matched]);
        console.log('transformed message', transformedMessage);
        console.log('transformed subject', transformedSubject);
        Mail.sendMail(email, transformedSubject, transformedMessage);
      }

      // Save family data
      const familyData = family.map(element => ({
        user_id: savedUser._id,
        familymember: element.familymember,
        relationship: element.relationship,
        famoccupation: element.famoccupation,
        famcontact: element.famcontact,
        income: element.income
      }));
      await FamilyData.insertMany(familyData);

      if (customfields) {
        for (const [key, value] of Object.entries(customfields)) {
          const customFieldMeta = {
            custom_field_id: new mongoose.Types.ObjectId(key),
            customfield_value: value,
            module: "user",
            user_id: new mongoose.Types.ObjectId(req.session.user_id),
            reference_id: savedUser._id,
            updated_at: moment(Date.now()).format("YYYY-MM-DD"),
          };
          await CustomFieldMeta.create(customFieldMeta);
        }
      }

      if (files) {
        for (const [key, value] of Object.entries(files)) {
          if (value.fieldname !== "photo") {
            const customFieldMeta = {
              custom_field_id: new mongoose.Types.ObjectId(value.fieldname),
              customfield_value: value.filename,
              module: "user",
              user_id: new mongoose.Types.ObjectId(req.session.user_id),
              reference_id: savedUser._id,
              updated_at: moment(Date.now()).format("YYYY-MM-DD"),
            };
            await CustomFieldMeta.create(customFieldMeta);
          }
        }
      }


      const formatdate = moment().format("YYYY-MM-DD");
      const user1 = await User.findOne({ "_id": savedUser._id });
      const myobj = {
        action: "New User",
        desc: "New account created.",
        user: new mongoose.Types.ObjectId(req.session.user_id),
        Name: req.body.username,
        date: formatdate,
        status: user1.status
      };
      console.log("User", myobj)
      const newNotificationBadge = new NotificationBadges(myobj);
      await newNotificationBadge.save();

      const noquery = { "user": new mongoose.Types.ObjectId(req.session.user_id) };
      const query = { $and: [{ status: 1 }, { "user": new mongoose.Types.ObjectId(req.session.user_id) }] };


      const notiresult = await NotificationBadges.find(noquery).lean();
      const adminnoti = await NotificationBadges.find().lean();

      const activenoti = await NotificationBadges.countDocuments(query);
      const adminnoticount = await NotificationBadges.countDocuments({});

      if (req.session.admin_access == 1) {
        req.session.noti = adminnoti;
        req.session.noticount = adminnoticount;
      } else {
        req.session.noti = notiresult;
        req.session.noticount = activenoti;
      }

      req.flash('success', res.__('User Inserted Successfully.'));
      res.redirect('/users/userlist');

    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.getViewUser = async (req, res) => {
  try {
    const id = req.params.id;

    if (id) {
      let result_data = [];
      const result = await User.find({ "_id": new mongoose.Types.ObjectId(id) }).lean();
      // result_data = result;
      // result_data[0].id_d = new mongoose.Types.ObjectId(result[0].role).toString();
      const role ={ "_id" : new mongoose.Types.ObjectId(result[0].role).toString() };

      const role_name = await Role.find(role).lean();
      for (const [key, value] of Object.entries(role_name)) {
        role_name[key].id_d = new mongoose.Types.ObjectId(value._id).toString();
      };
      const familyData = await FamilyData.find({ "user_id": new mongoose.Types.ObjectId(id) }).lean();
      if (familyData) {
        familyData.id_d = new mongoose.Types.ObjectId(familyData._id).toString();
      }

      res.render('users/viewuser', { title: "View User", data: result, role: role_name, family: familyData, id: id, session: req.session });
      console.log("User", result);
      console.log("Role", role_name);
      console.log("Family", familyData);

    } else {
      const news = [{ 'userid': '-1' }];
      res.render('users/adduser', { title: "View User", data: news, family: news, session: req.session });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}




/////////////////////////////////   API config   ///////////////////////////////////////////

exports.getApiConfig = async (req, res) => {
  try {
    const data = await fetchDataFromAPI();
    console.log(data);
    console.log('API called....');
    res.render('users/apiconfig', { title: 'NiftyEWS', session: req.session });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).send('Internal Server Error');
  }
};

async function fetchDataFromAPI() {
  return new Promise((resolve, reject) => {
    https.get('https://apideveloper.rblbank.com/test/sb/rbl/api/create_VA/create_VA', (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      });

      resp.on('error', (error) => {
        reject(error);
      });
    });
  });
}


////////////////////////////////////  user list  ///////////////////////////////////////////

exports.getUserList = async (req, res, next) => {
  try {
    let access_data = [];
    const access = await AccessRights.find({ rolename: req.session.role_slug }).lean();
    for (const [key, value] of Object.entries(access)) {
      for (const [key1, value1] of Object.entries(value['access_type'])) {
        if (key1 === "user") {
          access_data = value1;
        }
      }
    }

    // Check if user has access_rights and user, and owndata properties exist
    if (req.session.access_rights && req.session.access_rights.user && req.session.access_rights.user.owndata) {
     const query = {
        _id: new mongoose.Types.ObjectId(req.session.user_id)
      };
      const numOfDocs = await User.countDocuments(query);
    const activeuser = await User.countDocuments({ status: 1,_id: new mongoose.Types.ObjectId(req.session.user_id) });
    const deactiveuser = await User.countDocuments({ status: 0,_id: new mongoose.Types.ObjectId(req.session.user_id) });
    res.render('users/userlist', { title: 'User List', count: numOfDocs, activecount: activeuser, deactivecount: deactiveuser, session: req.session, accessrightdata: access_data, messages: req.flash() });
    } else {
      // Use a more generic query if user has broader access
     // Add additional conditions if needed
      const numOfDocs = await User.countDocuments({});
      const activeuser = await User.countDocuments({ status: 1 });
      const deactiveuser = await User.countDocuments({ status: 0 });
      res.render('users/userlist', { title: 'User List', count: numOfDocs, activecount: activeuser, deactivecount: deactiveuser, session: req.session, accessrightdata: access_data, messages: req.flash() });
    }
    // console.log("userlist : ",access_data)
  } catch (error) {
    next(error);
  }
};

exports.getDeactivateUser = async function (req, res, next) {
  try {
    if (req.session.access_rights && req.session.access_rights.deactiveuser && req.session.access_rights.deactiveuser.owndata) {
      const query = {
         _id: new mongoose.Types.ObjectId(req.session.user_id)
       };
    const numOfDocs = await User.countDocuments(query).lean();
    const activeuser = await User.countDocuments({ status: 1,_id: new mongoose.Types.ObjectId(req.session.user_id) }).lean();
    const deactiveuser = await User.countDocuments({ status: 0,_id: new mongoose.Types.ObjectId(req.session.user_id) }).lean();
    res.render('users/deactivateuser', {
      title: 'Deactivate Users',
      count: numOfDocs,
      activecount: activeuser,
      deactivecount: deactiveuser,
      session: req.session,
      messages: req.flash()
    });
  } else{
    const numOfDocs = await User.countDocuments().lean();
    const activeuser = await User.countDocuments({ status: 1}).lean();
    const deactiveuser = await User.countDocuments({ status: 0}).lean();
    res.render('users/deactivateuser', {
      title: 'Deactivate Users',
      count: numOfDocs,
      activecount: activeuser,
      deactivecount: deactiveuser,
      session: req.session,
      messages: req.flash()
    });
  }
  } catch (error) {
    next(error);
  }
};

exports.getDeactivateUserList = async (req, res, next) => {
  try {
    const users = await User.find({ status: 0 }).lean();

    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.deleteActivateUser = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await User.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

    if (result.deletedCount === 1) {
      res.redirect('/users/userlist');
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};
