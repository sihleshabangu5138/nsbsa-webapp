const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const fs = require("fs");
const userSchema = require("../models/User");
const Roleschema = require("../models/Role");
const Generalsettingschema = require("../models/GeneralSetting");
const AccessRightsSchema = require("../models/AccessRights");
const Notificationtemplateschema = require("../models/Notificationtemplate");
const ActivityLog = require("../models/Activitylog");
const Setting = require("../models/Settings");
const dotenv = require('dotenv');
const Reminder = require("../models/Reminder");

dotenv.config();
// const { connectToDatabase } = require("../config/config");

exports.getIns = (req, res, next) => {
  res.render("installation", {
    title: "NiftyEWS",
    layout: "loginlayout",
    session: req.session,
    message: req.flash(),
  });
};

exports.postIns = async (req, res) => {
  try {

    const generalSetting = Generalsettingschema({
      _id: new mongoose.Types.ObjectId("5d3ed73f5ec5ca0f0871f679"),
      business_type: "ITComapny",
      com_addr: "174 E. Wagon Street  Piscataway, NJ 08854",
      com_email: "alex@gmail.com",
      com_name: "Das",
      country_code: "111",
      email_bcc: "alex@gmail.com",
      footer_text: "CopyRight",
      gst_no: "174",
      phone: "2025550190",
      vat_no: "22222",
      zipcode: "48801",
      city: 6088,
      company_logo: "defaultLogo.png",
      country: 3,
      doctype: null,
      docupload_size: "11",
      imgtype: null,
      imgupload_size: "11",
      state: 112,
      currency: "USD",
      date_format: req.body.date_format,
      language: req.body.sys_language,
      time_format: "24",
      imgtype_jpeg: "jpeg",
      imgtype_jpg: "jpg",
      imgtype_png: "png",
      Default_tax: "SALES TAX",
      auto_round_off: "1",
      currency_set: "1",
      decimal_separator: ".",
      tax_item: "1",
      thousand_separator: ".",
      bank_details: "Das Testing Bank Details",
      invoice_client_note: "AAAAA",
      invoice_number_format: "2",
      invoice_predefined_terms: "AAAA",
      invoice_prefix: "Das",
      number_length: "2222",
      font_size: "12px",
      pdf_font: "12px",
      pdf_format: "LETTER-PORTRAIT",
      pdf_logo_url: "www.logo.png",
      pdf_logo_width: "234",
      show_pdf_signature_creditnote: "1",
      show_pdf_signature_invoice: "1",
      show_transaction: null,
      signature_image: null,
      swap_header: "0",
      tbl_head_color: "#01a2e9",
      tbl_head_txt_color: "#01a2e9",
      doctype_Doc: "doc",
      doctype_Docx: "docx",
      doctype_Pdf: "pdf",
      doctype_Xls: "xls",
      doctype_Xlsx: "xlsx",
      stripe_secret_key: null,
      stripe_publishable_key: null,
    });

    await generalSetting.save();

    const accessRights = [
      {
        _id: new mongoose.Types.ObjectId("5def648b11f6a21a04ba80cc"),
        rolename: "customer",
        access_type: null,
      },
      {
        _id: new mongoose.Types.ObjectId("5def64b511f6a21a04ba80cd"),
        rolename: "accountant",
        access_type: null,
      },
      {
        _id: new mongoose.Types.ObjectId("5df718d29adfd900c82a4dc5"),
        rolename: "staff",
        access_type: null,
      },
    ];

    await AccessRightsSchema.insertMany(accessRights);

    const Role = [
      {
        _id: new mongoose.Types.ObjectId("5d5685d8c7053f2780bb0753"),
        role_nm: "Admin",
        role_slug: "admin",
        role_desc: "Admin",
        admin_access: 1,
        allow_access: 1,
        status: 1,
      },
      {
        _id: new mongoose.Types.ObjectId("5d5ce97225a26b1fb45236ba"),
        role_nm: "Staff",
        role_slug: "staff",
        role_desc: "staff",
        admin_access: 0,
        allow_access: 1,
        status: 0,
      },
      {
        _id: new mongoose.Types.ObjectId("5dca8556a33db915988ba532"),
        role_nm: "Customer",
        role_slug: "customer",
        role_desc: "customer",
        admin_access: 0,
        allow_access: 1,
        status: 0,
      },
      {
        _id: new mongoose.Types.ObjectId("5de8c45b0b29ca27380fa307"),
        role_nm: "Accountant",
        role_slug: "accountant",
        role_desc: "accountant",
        admin_access: 0,
        allow_access: 1,
        status: 0,
      },
    ];

    await Roleschema.insertMany(Role);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const userObj = new userSchema({
      _id: new mongoose.Types.ObjectId("65731827d0b92a5bcb33cfb7"),
      firstname: "admin",
      middlename: "admin",
      lastname: "admin",
      email: req.body.email,
      photo: "default.png",
      ccode: "000",
      mobile: "9999999999",
      occupation: "admin",
      birthdate: Date.now(),
      gender: "male",
      username: req.body.username,
      role: new mongoose.Types.ObjectId("5d5685d8c7053f2780bb0753"),
      password: hashedPassword,
      address: "India",
      country: parseInt("000", 10),
      state: parseInt("000", 10),
      city: parseInt("000", 10),
      pincode: "000000",
      accountnumber: "00000000000",
      pannumber: "YYYYY0000Y",
      status: 1,
    });

    const newUser = await userObj.save();

    const activityLogs = new ActivityLog({
      date: Date.now(),
      module: "User",
      action: "inserted user named admin",
      user: new mongoose.Types.ObjectId(newUser._id),
      item: req.body.username,
      status: 0,
    });
    await activityLogs.save();

    const notificationTemplates = [
      {
        _id: new mongoose.Types.ObjectId("5d8a049a3d22980b18c1624e"),
        notificationtype: "email",
        slug: "add user",
        templatetitle: "Added User",
        subject: "You are successully added at _systemname_.",
        content:
          "Dear _USERFIRSTNAME_ _USERLASTNAME_,_newline_ _tab_ You are successully added at _systemname_.  Your have been assigned role of _ROLENAME_  in _systemname_. You can access system using your username and password.  You can signin using this link. Your credentials are below : _newline__newline__tab_User Name : _username_,_newline__tab_Password : _password_ _newline__tab__link_._newline__tab__newline_Regards From  _systemname_.",
      },

      {
        _id: new mongoose.Types.ObjectId("5d8c6ff908cb970a6058eee9"),
        notificationtype: "email",
        slug: "Add Loan",
        templatetitle: "Loan Add",
        subject: "Loan added successfully.",
        content:
          "Dear _USERFIRSTNAME_ _USERLASTNAME_,_newline__tab_Your _LOANTYPE_ has been successfully added on _datetime_,Your EMI months will be starting from _LOANSTARTDATE_ and will end on _LOANENDDATE_ _newline_Regards From System Name.",
      },

      {
        _id: new mongoose.Types.ObjectId("5d8d9aa297f6bb2b8cbd2876"),
        notificationtype: "email",
        slug: "Loan Approved",
        templatetitle: "Loan Approved",
        subject: "Loan approved.",
        content:
          "Hello _USERFIRSTNAME_ _USERLASTNAME_, _newline__tab_Your _LOANTYPE_ has been approved. You can start your EMI as per time period._newline_Thank You.",
      },

      {
        _id: new mongoose.Types.ObjectId("5de1f5d158f0562cccc386d2"),
        notificationtype: "email",
        slug: "add event",
        templatetitle: "One day Event Added",
        subject: "Event added successfully.",
        content:
          "Dear _USERFIRSTNAME_ _USERLASTNAME_, _newline_Here is the new Event from _systemname_._newline_ _tab_Title : _EVENTNAME_.._newline_ _tab_Event Venue : _EVENTVENUE_.._newline_ _tab_Event Start Date : _EVENTSTARTDATE_.._newline_Regards From _systemname_.",
      },

      {
        _id: new mongoose.Types.ObjectId("5de1fe40fd51782ed08a3f24"),
        notificationtype: "email",
        slug: "add event",
        templatetitle: "Multiple days Event Added",
        subject: "Event added successfully",
        content:
          "Dear _USERFIRSTNAME_ _USERLASTNAME_,_newline_Here is the new Event from EWS._newline__tab_Title : _EVENTNAME_._newline__tab_Event Venue : _EVENTVENUE_._newline__tab_Event Start Date : _EVENTSTARTDATE_._newline__tab_Event EndDate : _EVENTENDDATE_._newline_Regards From _systemname_.",
      },

      {
        _id: new mongoose.Types.ObjectId("5dea1dc46b539e2704a5fd1c"),
        notificationtype: "email",
        slug: "update event",
        templatetitle: "one day event updated",
        subject: "Update in _EVENTNAME_ From _systemname_.",
        content:
          "Dear _USERFIRSTNAME_ _USERLASTNAME_, _newline__tab_Here is some updates in event _EVENTNAME_   from EWS._newline__tab_Title : _EVENTNAME_._newline__tab_Event Venue : _EVENTVENUE_._newline__tab_Event Start Date : _EVENTSTARTDATE_._newline_Regards From _systemname_.",
      },

      {
        _id: new mongoose.Types.ObjectId("5dea204e6b539e2704a5fd1e"),
        notificationtype: "email",
        slug: "update event",
        templatetitle: "multiple day event updated",
        subject: "Update in _EVENTNAME_ From _systemname_.",
        content:
          "Dear _USERFIRSTNAME_ _USERLASTNAME_, _newline__tab_Here is some updates in event _EVENTNAME_   from _systemname_._newline__tab__tab_Title : _EVENTNAME_._newline__tab__tab_Event Venue : _EVENTVENUE_._newline__tab__tab_Event Start Date : _EVENTSTARTDATE_._newline__tab__tab_Event EndDate : _EVENTENDDATE_._newline_Regards From _systemname_.\r\n",
      },

      {
        _id: new mongoose.Types.ObjectId("5dea2bc728830f282c3ba42e"),
        notificationtype: "email",
        slug: "delete event",
        templatetitle: "one day event deleted",
        subject: "_EVENTNAME_  Cancelled From _systemname_.",
        content:
          "Dear _USERFIRSTNAME_ _USERLASTNAME_,_newline__tab__EVENTNAME_ has been cancelled._newline__tab__tab_Title : _EVENTNAME_._newline__tab__tab_Event Venue : _EVENTVENUE_._newline__tab__tab_Event Start Date : _EVENTSTARTDATE_. _newline_Regards From _systemname_.",
      },

      {
        _id: new mongoose.Types.ObjectId("5dea2c4028830f282c3ba431"),
        notificationtype: "email",
        slug: "delete event",
        templatetitle: "multiple day event deleted",
        subject: "_EVENTNAME_  Cancelled From _systemname_.",
        content:
          "Dear _USERFIRSTNAME_ _USERLASTNAME_,_newline__tab__EVENTNAME_ has been cancelled._newline__tab__tab_Title : _EVENTNAME_._newline__tab__tab_Event Venue : _EVENTVENUE_._newline__tab__tab_Event Start Date : _EVENTSTARTDATE_. _newline__tab__tab_Event EndDate : _EVENTENDDATE_._newline_Regards From _systemname_.",
      },

      {
        _id: new mongoose.Types.ObjectId("5df069667f4fd726c4d220a6"),
        notificationtype: "email",
        slug: "update user",
        templatetitle: "user profile updated",
        subject: "Profile Updated Succesfully at _systemname_",
        content:
          "Dear _USERFIRSTNAME_ _USERLASTNAME_,_newline__tab_Your Profile has been successfully Updated on _DATETIME_, _newline_Regards From _systemname_.",
      },

      {
        _id: new mongoose.Types.ObjectId("5df06fb80cba9c1f204f61e0"),
        notificationtype: "email",
        slug: "delete user",
        templatetitle: "user deleted",
        subject: "Your Account Deleted from _systemname_",
        content:
          "Dear _USERFIRSTNAME_ _USERLASTNAME_,_newline__tab_Your Profile has been deleted from _systemname_ on _DATETIME_, _newline_Regards From _systemname_.",
      },
      {
        _id:new mongoose.Types.ObjectId("609908b99c17b83414d57356"),
        notificationtype: "email",
        slug: "Upcoming Emi Notification",
        templatetitle: "Upcoming Emi Notification",
        subject: "Upcoming Emi Payment",
        content: "Hi _USERFIRSTNAME_ _USERLASTNAME_ ,_newline_ _tab_ Just friendly reminder that your EMI Payment come. _newline_  _tab_ We hope we help you for your payment._newline__tab__newline_Regards From  _systemname_."
    }, {
        _id:new mongoose.Types.ObjectId("609a2c1302603d1c94652cf9"),
        notificationtype: "email",
        slug: "EMI Payment Pending",
        templatetitle: "EMI Payment Pending",
        subject: "EMI Payment Pending",
        content: "Hi _USERFIRSTNAME_ _USERLASTNAME_ ,_newline_ _tab_ You EMI Payment is remain of last month. Please check Emi payments. _newline_  _tab_ We hope we help you for your payment._newline__tab__newline_Regards From  _systemname_."
    }
    ];

    await Notificationtemplateschema.insertMany(notificationTemplates);
    const remindersData = [
      {
        _id:new mongoose.Types.ObjectId("60990d47ae2e4f1668854a99"),
        reminder_nm: "Upcoming EMI",
        reminder_template: "Upcoming Emi Notification",
        reminder_desc: "Upcoming EMI",
        reminder_will_send: "Before",
        reminder_type: "upcoming_emi",
        reminderdata: [{
          "number": "3",
          "recurense": "days"
        }]
      },
      {
        _id:new mongoose.Types.ObjectId("609a2c4102603d1c94652cfb"),
        reminder_nm: "Emi Payment remain",
        reminder_template: "EMI Payment Pending",
        reminder_desc: "Emi payment remain",
        reminder_will_send: "After",
        reminder_type: "emi_pending",
        reminderdata: [{
          "number": "3",
          "recurense": "days"
        }]
      },
    ];

    await Reminder.insertMany(remindersData);

    const installation = {
      installation: "true",
    }
    await Setting.updateOne(installation);
    // await mongoose.connection.close();
    console.log("closed");
    req.flash('success', res.__('Installation completed Successfully.'));
    res.redirect("/");
  } catch (error) {
    // Handle the error
    console.error(error);
    res.redirect("installation");
  }
};
