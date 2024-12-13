const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const GeneralSetting = require('../models/GeneralSetting');
const User = require('../models/User');
const LoanType = require('../models/Loantype');
const Event = require('../models/Events');
const Reminder = require('../models/Reminder');
const LoanDetails = require('../models/LoanDetails');
const Role = require('../models/Role');
const lang = require('../config/languageconfig');
const cookieParser = require('cookie-parser');
const EmiDetails = require('../models/Emi_details');
const NotificationTemplate = require('../models/Notificationtemplate');
const { sendMail } = require('../config/email');
router.use(cookieParser());
const moment = require('moment');
const NotificationBadges = require('../models/Notification_badges');
const functions = require('../helpers/function')
// Your Mongoose connection code (assumes you have set up Mongoose earlier)

/* GET home page. */
exports.getDashboard = async (req, res, next) => {
  // console.log(req.session);
  try {
    let currentDateFormate = functions.formatDatesToGeneralData(req.session.generaldata.date_format);
    const notificationTypes = ['upcoming_emi', 'emi_pending'];
        const reminders = await Reminder.find({ reminder_type: notificationTypes }).lean();
        // console.log("rem",reminders)

        for (const [keys, values_n] of Object.entries(reminders)) {
          var befor_after = values_n.reminder_will_send;
          var reminder_template = values_n.reminder_template;

          for (const [keys, values1] of Object.entries(values_n.reminderdata)) {
              var number_day = values1.number;
          }
        
        console.log("befor_after", befor_after);
        // console.log("reminder_template", reminder_template);
            // console.log("numberDay", number_day);

            let addDate;

            if (befor_after === 'Before') {
                addDate = moment().add(number_day, 'd');
            } else {
                addDate = moment().subtract(number_day, 'd');
            }

            addDate =moment(addDate).format('YYYY-MM-DD');
            // console.log("adddate:",addDate);

            const result1 = await EmiDetails.aggregate([
                {
                    $lookup: {
                        from: LoanDetails.collection.name,
                        localField: 'loan_id',
                        foreignField: '_id',
                        as: 'loan'
                    }
                },
                { $unwind: '$loan' },
                {
                    $lookup: {
                        from: User.collection.name,
                        localField: 'user_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                {
                    $match: {
                        $and: [{ mail_noti: 0, status: 0 }]
                    }
                }
            ]);
            // console.log("result1",result1)
            for (const [key1, value1] of Object.entries(result1)) {
              // console.log("das:",value1)
          // console.log("Values:", value1.loan.approvestatus, value1.loan.status, addDate);
                if (value1.loan.approvestatus === 1 || value1.loan.status === 0) {
                    const dateOfEmi = value1.date;
                    // console.log("dateOfEmi", dateOfEmi);
                    // console.log("addDate", addDate);
                    if (addDate === dateOfEmi) {
                        const notification = await NotificationTemplate.findOne({ slug: reminder_template });

                        if (notification) {
                            const { content, subject } = notification;
                            const startDate = dateOfEmi;
                            const endDate = dateOfEmi;
                            const replacements = {
                                '_USERFIRSTNAME_': value1.user.firstname,
                                '_USERLASTNAME_': value1.user.lastname,
                                '_datetime_': moment().format("YYYY-MM-DD"),
                                '_LOANSTARTDATE_': startDate,
                                '_LOANENDDATE_': endDate,
                                '_newline_': '<br>',
                                '_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
                                '_systemname_': req.session.generaldata.com_name
                            };

                            const transformedContent = content.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_LOANTYPE_|_newline_|_tab_|_systemname_|_datetime_|_LOANSTARTDATE_|_LOANENDDATE_/gi, matched => replacements[matched]);
                            const transformedSubject = subject.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_LOANTYPE_|_newline_|_tab_|_systemname_/gi, matched => replacements[matched]);

                            // console.log("trans",transformedContent);
                            // console.log("trans",transformedSubject);
                            await sendMail(value1.user.email, transformedSubject, transformedContent);
                            const query3 = { _id:new mongoose.Types.ObjectId(value1._id) };
                const newValues = { $set: { mail_noti: 1 } };

                await EmiDetails.updateOne(query3, newValues);
                        }
                    }
                }

              }
            }

    const result = GeneralSetting.find({}).lean;
    // console.log(req.session.admin_access);

    if (result && result[0] && result[0].language) {
      lang.setLocale(result[0].language);
      res.cookie('locale', result[0].language, {
        maxAge: 90000000,
        httpOnly: true,
      });
    }
    const languages = lang.getLocale();
    if (req.session.admin_access == 0) {
      const userOwnData = req.session.access_rights && req.session.access_rights.user && req.session.access_rights.user.owndata === 'user_owndata';
    const loanListOwnData = req.session.access_rights && req.session.access_rights.loanlist && req.session.access_rights.loanlist.owndata === 'loan_list_owndata';
    console.log("data",userOwnData,loanListOwnData);
      // if (req.session.access_rights && req.session.access_rights.loanlist && req.session.access_rights.loanlist.owndata == undefined && req.session.access_rights.user.owndata === 'user_owndata') {
      if (userOwnData && !loanListOwnData) {
        console.log("DASHBOARD by 2---------------------cUSTOMER");
        const activeuser = await User.countDocuments({ status: 1, _id: new mongoose.Types.ObjectId(req.session.user_id) }).lean();
        const deactiveuser = await User.countDocuments({ status: 0, _id: new mongoose.Types.ObjectId(req.session.user_id) }).lean();
        const totalloan = await LoanDetails.countDocuments({ status: 1 }).lean();
        const num_of_loan = await LoanDetails.countDocuments({ $and: [{ status: 1 }, { approvestatus: 1 }] }).lean();
        const num_of_disloan = await LoanDetails.countDocuments({ $and: [{ status: 1 }, { approvestatus: 0 }] }).lean();
        
        const userresult = await User.find({ status: 1, _id: new mongoose.Types.ObjectId(req.session.user_id) }).lean().limit(4);
        const loanresult = await LoanType.find().limit(5).lean();
        const loan = await LoanDetails.find({ status: 1 }).lean().limit(3);
        const result_final = [];
        const result = await Event.find({}).lean();
        if (req.session.access_rights && req.session.access_rights.events && req.session.access_rights.events.owndata) {
          for (const value of result) {
            const role = await Role.findOne(new mongoose.Types.ObjectId(req.session.role));
            if (role.role_nm == "Staff") {
              if (value.eventfor == "all" || value.eventfor.equals(new mongoose.Types.ObjectId(req.session.role)) || (value.addedby && value.addedby.equals(new mongoose.Types.ObjectId(req.session.user_id)))) {
                // console.log('Pushing value:', value);
                result_final.push(value);
              }
            }
            else {
              if (value.eventfor == "all" || value.eventfor.equals(new mongoose.Types.ObjectId(req.session.role))) {
                result_final.push(value);
              }
            }
          }
        } else {
          result_final.push(...result);
        }

        const reminder = await Reminder.find({}).lean();
        const generalSettings = await GeneralSetting.find({}).lean();
        const userLanguage = generalSettings[0].language;
        // console.log(userLanguage);
        
        result_final.forEach((ele) => {
          ele.startdate = moment(ele.startdate, "YYYY-MM-DD").format(currentDateFormate);
          ele.enddate = moment(ele.enddate, "YYYY-MM-DD").format(currentDateFormate);
          return ele
        })
        
       
        res.render('index', {
          title: 'Dashboard',
          session: req.session,
          activecount: activeuser,
          activeuser: activeuser,
          deactiveuser: deactiveuser,
          loanno: num_of_loan,
          setlang: languages,
          userdata: userresult,
          loandata: loanresult,
          loan: loan,
          events: result_final,
          Reminder: reminder,
          num_of_disloan: num_of_disloan,
          loans: totalloan,
          calendar_data: userLanguage,
        });
      }
      // else if (req.session.access_rights && req.session.access_rights.loanlist && req.session.access_rights.loanlist.owndata == 'loan_list_owndata' &&
      //   req.session.access_rights.user &&
      //   req.session.access_rights.user.owndata === undefined) {
      else if (!userOwnData && loanListOwnData) {
        console.log("DASHBOARD by 3","----------------------");
        const role = await Role.findOne({ _id: new mongoose.Types.ObjectId(req.session.role) }).lean();
        let query, approvedQuery, disapprovedQuery;
        if (role.role_nm == "Staff") {
          query = {
            $and: [{ status: 1 }, { createdby: new mongoose.Types.ObjectId(req.session.user_id) }]
          };
          approvedQuery = { $and: [{ status: 1 }, { approvestatus: 1 }, { createdby: new mongoose.Types.ObjectId(req.session.user_id) }] };
          disapprovedQuery = { $and: [{ status: 1 }, { approvestatus: 0 }, { createdby: new mongoose.Types.ObjectId(req.session.user_id) }] };

        }
        else {
          query = {
            $and: [{ status: 1 }, { user: new mongoose.Types.ObjectId(req.session.user_id) }]
          };
          approvedQuery = { $and: [{ status: 1 }, { approvestatus: 1 }, { user: new mongoose.Types.ObjectId(req.session.user_id) }] };
          disapprovedQuery = { $and: [{ status: 1 }, { approvestatus: 0 }, { user: new mongoose.Types.ObjectId(req.session.user_id) }] };

        }
        const activeuser = await User.countDocuments({ status: 1 }).lean();
        const deactiveuser = await User.countDocuments({ status: 0 }).lean();
        const totalloan = await LoanDetails.countDocuments(query).lean();
        const num_of_loan = await LoanDetails.countDocuments(approvedQuery).lean();
        const num_of_disloan = await LoanDetails.countDocuments(disapprovedQuery).lean();

        const userresult = await User.find({ status: 1 }).lean().limit(4);
        const loanresult = await LoanType.find().limit(5).lean();
        const loan = await LoanDetails.find(query).lean().limit(3);
        const result_final = [];
        const result = await Event.find({}).lean();
        if (req.session.access_rights && req.session.access_rights.events && req.session.access_rights.events.owndata) {
          for (const value of result) {
            const role = await Role.findOne(new mongoose.Types.ObjectId(req.session.role));
            if (role.role_nm == "Staff") {
              if (value.eventfor == "all" || value.eventfor.equals(new mongoose.Types.ObjectId(req.session.role)) || (value.addedby && value.addedby.equals(new mongoose.Types.ObjectId(req.session.user_id)))) {
                // console.log('Pushing value:', value);
                result_final.push(value);
              }
            }
            else {
              if (value.eventfor == "all" || value.eventfor.equals(new mongoose.Types.ObjectId(req.session.role))) {
                result_final.push(value);
              }
            }
          }
        } else {
          result_final.push(...result);
        }
        const reminder = await Reminder.find({}).lean();
        const generalSettings = await GeneralSetting.find({}).lean();
        const userLanguage = generalSettings[0].language;
        // console.log(userLanguage);
        result_final.forEach((ele) => {
          ele.startdate = moment(ele.startdate, "YYYY-MM-DD").format(currentDateFormate);
          ele.enddate = moment(ele.enddate, "YYYY-MM-DD").format(currentDateFormate);
          return ele
        })

        res.render('index', {
          title: 'Dashboard',
          session: req.session,
          activecount: activeuser,
          activeuser: activeuser,
          deactiveuser: deactiveuser,
          loanno: num_of_loan,
          setlang: languages,
          userdata: userresult,
          loandata: loanresult,
          loan: loan,
          events: result_final,
          Reminder: reminder,
          num_of_disloan: num_of_disloan,
          loans: totalloan,
          calendar_data: userLanguage,
        });
      }
      else if (userOwnData && loanListOwnData) {
        console.log("DASHBOARD by all,--------------------");
        const role = await Role.findOne({ _id: new mongoose.Types.ObjectId(req.session.role) }).lean();
        let query, approvedQuery, disapprovedQuery;
        if (role.role_nm == "Staff") {
          query = {
            $and: [{ status: 1 }, { createdby: new mongoose.Types.ObjectId(req.session.user_id) }]
          };
          approvedQuery = { $and: [{ status: 1 }, { approvestatus: 1 }, { createdby: new mongoose.Types.ObjectId(req.session.user_id) }] };
          disapprovedQuery = { $and: [{ status: 1 }, { approvestatus: 0 }, { createdby: new mongoose.Types.ObjectId(req.session.user_id) }] };

        }
        else {
          query = {
            $and: [{ status: 1 }, { user: new mongoose.Types.ObjectId(req.session.user_id) }]
          };
          approvedQuery = { $and: [{ status: 1 }, { approvestatus: 1 }, { user: new mongoose.Types.ObjectId(req.session.user_id) }] };
          disapprovedQuery = { $and: [{ status: 1 }, { approvestatus: 0 }, { user: new mongoose.Types.ObjectId(req.session.user_id) }] };

        }
        const activeuser = await User.countDocuments({ status: 1, _id: new mongoose.Types.ObjectId(req.session.user_id) }).lean();
        const deactiveuser = await User.countDocuments({ status: 0, _id: new mongoose.Types.ObjectId(req.session.user_id) }).lean();
        const totalloan = await LoanDetails.countDocuments(query).lean();
        const num_of_loan = await LoanDetails.countDocuments(approvedQuery).lean();
        const num_of_disloan = await LoanDetails.countDocuments(disapprovedQuery).lean();

        const userresult = await User.find({ status: 1, _id: new mongoose.Types.ObjectId(req.session.user_id) }).lean().limit(4);
        const loanresult = await LoanType.find().limit(5).lean();
        const loan = await LoanDetails.find(query).lean().limit(3);
        const result_final = [];
        const result = await Event.find({}).lean();
        if (req.session.access_rights && req.session.access_rights.events && req.session.access_rights.events.owndata) {
          for (const value of result) {
            const role = await Role.findOne(new mongoose.Types.ObjectId(req.session.role));
            if (role.role_nm == "Staff") {
              if (value.eventfor == "all" || value.eventfor.equals(new mongoose.Types.ObjectId(req.session.role)) || (value.addedby && value.addedby.equals(new mongoose.Types.ObjectId(req.session.user_id)))) {
                // console.log('Pushing value:', value);
                // if(value.addedby && value.addedby.equals(new mongoose.Types.ObjectId(req.session.user_id))){
                //   value.isAddedByLoggedInUser= (value.addedby && value.addedby.equals(new mongoose.Types.ObjectId(req.session.user_id)));
                // }
                result_final.push(value);
              }
            }
            else {
              if (value.eventfor == "all" || value.eventfor.equals(new mongoose.Types.ObjectId(req.session.role))) {
                result_final.push(value);
              }
            }
          }
        } else {
          result_final.push(...result);
        }
        const reminder = await Reminder.find({}).lean();
        const generalSettings = await GeneralSetting.find({}).lean();
        const userLanguage = generalSettings[0].language;
        // console.log(userLanguage);
        result_final.forEach((ele) => {
          ele.startdate = moment(ele.startdate, "YYYY-MM-DD").format(currentDateFormate);
          ele.enddate = moment(ele.enddate, "YYYY-MM-DD").format(currentDateFormate);
          return ele
        })

        res.render('index', {
          title: 'Dashboard',
          session: req.session,
          activecount: activeuser,
          activeuser: activeuser,
          deactiveuser: deactiveuser,
          loanno: num_of_loan,
          setlang: languages,
          userdata: userresult,
          loandata: loanresult,
          loan: loan,
          events: result_final,
          Reminder: reminder,
          num_of_disloan: num_of_disloan,
          loans: totalloan,
          calendar_data: userLanguage,
        });
      }
      else {
        console.log("DASHBOARD by 4-------------------------");
        const role = await Role.find({ "role_slug": "customer" }).lean();
        // console.log( "Roledata",role);
        const activecount = await User.countDocuments({ role: role[0]._id }).lean();
        const activeuser = await User.countDocuments({ status: 1 }).lean();
        const deactiveuser = await User.countDocuments({ status: 0 }).lean();
        const totalloan = await LoanDetails.countDocuments({ $and: [{ status: 1 }] }).lean();
        const num_of_loan = await LoanDetails.countDocuments({ $and: [{ status: 1 }, { approvestatus: 1 }] }).lean();
        const num_of_disloan = await LoanDetails.countDocuments({ $and: [{ status: 1 }, { approvestatus: 0 }] }).lean();

        let matchQuery;
        matchQuery = {
          status: 1
        }
        if (req.session.admin_access !== 1) {
          // If admin access is 0, hide users with admin role
          matchQuery['role_nm.role_slug'] = { $ne: 'admin' };
          console.log("admin access = 0")
        }
        const userresult = await User.aggregate([
          {
            $lookup: {
              from: Role.collection.name,
              localField: 'role',
              foreignField: '_id',
              as: 'role_nm',
            },
          },
          {
            $unwind: '$role_nm',
          },
          {
            $match: matchQuery,
          },
        ]).limit(4);
        const loanresult = await LoanType.find().limit(5).lean();
        const loan = await LoanDetails.find({ status: 1 }).lean().limit(3);
        const result_final = [];
        const result = await Event.find({}).lean();
        if (req.session.access_rights && req.session.access_rights.events && req.session.access_rights.events.owndata) {
          for (const value of result) {
            const role = await Role.findOne(new mongoose.Types.ObjectId(req.session.role));
            if (role.role_nm == "Staff") {
              if (value.eventfor == "all" || value.eventfor.equals(new mongoose.Types.ObjectId(req.session.role)) || (value.addedby && value.addedby.equals(new mongoose.Types.ObjectId(req.session.user_id)))) {
                // console.log('Pushing value:', value);
                result_final.push(value);
              }
            }
            else {
              if (value.eventfor == "all" || value.eventfor.equals(new mongoose.Types.ObjectId(req.session.role))) {
                result_final.push(value);
              }
            }
          }
        } else {
          result_final.push(...result);
        }
        const reminder = await Reminder.find({}).lean();
        const generalSettings = await GeneralSetting.find({}).lean();
        const userLanguage = generalSettings[0].language;
        // console.log(userLanguage);
        result_final.forEach((ele) => {
          ele.startdate = moment(ele.startdate, "YYYY-MM-DD").format(currentDateFormate);
          ele.enddate = moment(ele.enddate, "YYYY-MM-DD").format(currentDateFormate);
          return ele
        })

        res.render('index', {
          title: 'Dashboard',
          session: req.session,
          activecount: activecount,
          activeuser: activeuser,
          deactiveuser: deactiveuser,
          loanno: num_of_loan,
          setlang: languages,
          userdata: userresult,
          loandata: loanresult,
          loan: loan,
          events: result_final,
          Reminder: reminder,
          num_of_disloan: num_of_disloan,
          loans: totalloan,
          calendar_data: userLanguage,
        });
      }
    }
    else {
      console.log("DASHBOARD by 5-------------------------Admin");
      const role = await Role.find({ "role_slug": "customer" }).exec();
      console.log( "Roledata",role);
      // const activecount = await User.countDocuments({ role: role[0]._id }).lean();
      const activecount = await User.countDocuments().lean();
      console.log("activecount", activecount);
      const activeuser = await User.countDocuments({ status: 1 }).lean();
      const deactiveuser = await User.countDocuments({ status: 0 }).lean();
      const totalloan = await LoanDetails.countDocuments({ $and: [{ status: 1 }] }).lean();
      const num_of_loan = await LoanDetails.countDocuments({ $and: [{ status: 1 }, { approvestatus: 1 }] }).lean();
      const num_of_disloan = await LoanDetails.countDocuments({ $and: [{ status: 1 }, { approvestatus: 0 }] }).lean();

      const userresult = await User.find({ status: 1 }).lean().limit(4);
      const loanresult = await LoanType.find().limit(5).lean();
      const loan = await LoanDetails.find({ status: 1 }).lean().limit(3);
      const result_final = [];
      const result = await Event.find({}).lean();
      if (req.session.access_rights && req.session.access_rights.events && req.session.access_rights.events.owndata) {
        for (const value of result) {
          const role = await Role.findOne(new mongoose.Types.ObjectId(req.session.role));
          if (role.role_nm == "Staff") {
            if (value.eventfor == "all" || value.eventfor.equals(new mongoose.Types.ObjectId(req.session.role)) || (value.addedby && value.addedby.equals(new mongoose.Types.ObjectId(req.session.user_id)))) {
              // console.log('Pushing value:', value);
              result_final.push(value);
            }
          }
          else {
            if (value.eventfor == "all" || value.eventfor.equals(new mongoose.Types.ObjectId(req.session.role))) {
              result_final.push(value);
            }
          }
        }
      } else {
        result_final.push(...result);
      }
      const reminder = await Reminder.find({}).lean();
      const generalSettings = await GeneralSetting.find({}).lean();
      const userLanguage = generalSettings[0].language;
      // console.log(userLanguage);
      result_final.forEach((ele) => {
        ele.startdate = moment(ele.startdate, "YYYY-MM-DD").format(currentDateFormate);
        ele.enddate = moment(ele.enddate, "YYYY-MM-DD").format(currentDateFormate);
        return ele
      })

      res.render('index', {
        title: 'Dashboard',
        session: req.session,
        activecount: activecount,
        activeuser: activeuser,
        deactiveuser: deactiveuser,
        loanno: num_of_loan,
        setlang: languages,
        userdata: userresult,
        loandata: loanresult,
        loan: loan,
        events: result_final,
        Reminder: reminder,
        num_of_disloan: num_of_disloan,
        loans: totalloan,
        calendar_data: userLanguage,
        messages: req.flash(),
      });
    };

  } catch (err) {
    console.log(err);
    next(err);
  }
};


exports.getNotiBadge = async (req, res, next) => {
  let data = [];
  const mysort = { createdAt: -1 };
  const noquery = { "user": new mongoose.Types.ObjectId(req.session.user_id), status: 1 };
  const notiresult = await NotificationBadges.find(noquery).lean().sort(mysort);
  const adminnoti = await NotificationBadges.find({ status: 1 }).lean().sort(mysort);
  // console.log('notiresult', notiresult);
  // console.log('adminnoti', adminnoti);

  // console.log(adminnoti);
  // if(req.session.admin_access == 1){
  //   data = adminnoti;
  // }else{
  //   data = notiresult;
  // }
  // console.log("adminnoti :", adminnoti);
  // const data = (req.session.admin_access === 1) ? adminnoti : notiresult;
  if (req.session.admin_access == 1){
    data = adminnoti;
  }else{
    data = notiresult;
  };
  // console.log('req.session.admin_access', req.session.admin_access);
 
  res.render('notificationlist/notificationlist', {
    title: 'Notificationlist',
    session: req.session,
    messages: req.flash(),
    data: data,
  });
}
