const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const moment = require('moment');
const lang = require('../config/languageconfig');
const AccessRights = require('../models/AccessRights');
const CustomField = require('../models/Customfields');
const CustomFieldMeta = require('../models/CustomFieldMeta');
const Loantype = require('../models/Loantype');
const ActivityLog = require('../models/Activitylog');
const LoanDetails = require('../models/LoanDetails');
const Users = require('../models/User');
const Generalsetting = require('../models/GeneralSetting');
const Notes = require('../models/Notes');
const NotificationTemplate = require('../models/Notificationtemplate');
const AmortizeJS = require('amortizejs').Calculator;
const NotificationBadges = require('../models/Notification_badges');
const EmiDetails = require('../models/Emi_details');
const Repayment = require('../models/RePayment');
const Mail = require('../config/email');
const Role = require('../models/Role');
const Reminder = require('../models/Reminder');
const functions = require('../helpers/function');
const Stripe = require('stripe');
const { Session } = require('express-session');

// const __basedir = path.resolve(__dirname, '../..');

exports.getLoanTypeList = async function (req, res, next) {
    try {
        const access = await AccessRights.find({ rolename: req.session.role_slug });
        let access_data = [];
        for (const [key, value] of Object.entries(access)) {
            for (const [key1, value1] of Object.entries(value['access_type'])) {
                if (key1 === "typeofloan") {
                    access_data = value1;
                }
            }
        }
        res.render('loan/loantypelist', { title: 'Types of Loan', session: req.session, messages: req.flash(), accessrightdata: access_data });
    } catch (err) {
        next(err);
    }
};

exports.getAddLoanType = async (req, res) => {
       
    try {
        let currentDateFormat = functions.formatDatesToGeneralData(req.session.generaldata.date_format);

        const languages = lang.getLocale();
        const id = req.params.id;
        if (id) {
            const myquary = { "_id": new mongoose.Types.ObjectId(id) };
            const result = await Loantype.find(myquary).lean();
            const customfield = await CustomField.find({ $and: [{ "module_name": "loantype" }, { "field_visibility": 1 }] }).lean();
            customfield.forEach(element => {
                element.id_d = new mongoose.Types.ObjectId(element._id).toString();
            });
            const customfield_value = await CustomFieldMeta.find({ "reference_id": id }).lean();
            customfield_value.forEach(element => {
                element.id_d = new mongoose.Types.ObjectId(element.custom_field_id).toString();
                element.customfield_value[0] = functions.handleInputDateOrValue(element.customfield_value[0],currentDateFormat,"toFrontend");
                console.log(element.customfield_value[0])
            });

            // console.log(customfield_value,"---------------");
            res.render('loan/addloantype', { title: "Edit Loan Types", data: result, id: id, session: req.session, setlang: languages, newfield: customfield, customfield_value: customfield_value });
        } else {
            const news = [{ 'userid': '-1' }];
            const customfield = await CustomField.find({ $and: [{ "module_name": "loantype" }, { "field_visibility": 1 }] }).lean();
            res.render('loan/addloantype', { title: "Add Loan Types", data: news, session: req.session, newfield: customfield });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.postAddLoanType = async (req, res) => {
    let currentDateFormat = functions.formatDatesToGeneralData(req.session.generaldata.date_format);
    
    try {
        const id = req.body.id;
        if (id) {
            const myquery = { "_id": new mongoose.Types.ObjectId(id) };
            const newvalues = {
                $set: {
                    type: req.body.type,
                    loan_desc: req.body.loan_desc,
                    loan_min_amount: req.body.loan_min_amount,
                    loan_max_amount: req.body.loan_max_amount,
                    interestrate: req.body.interestrate,
                    latepaymentcharge: req.body.latepaymentcharge,
                    processingfee: req.body.processingfee,
                    updatedby: new mongoose.Types.ObjectId(req.session.user_id),
                }
            };

            // const result = 
            await Loantype.updateOne(myquery, newvalues);

            // const date = Date(Date.now());
            const formatdate = moment().format("YYYY-MM-DD");

            const activityLog = {
                date: formatdate,
                module: "Loan Type",
                action: "updated loantype",
                user: new mongoose.Types.ObjectId(req.session.user_id),
                item: req.body.type,
                status: 0,
            };

            await ActivityLog.create(activityLog);

            const query = { "reference_id": new mongoose.Types.ObjectId(id) };
            const metadata = await CustomFieldMeta.find(query).lean();

            if (metadata.length > 0) {
                // Get the current date and format it
                // const date = Date.now();
                const formattedDate = moment().format('YYYY-MM-DD');

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
                            customfield_value: functions.handleInputDateOrValue(values1, currentDateFormat),
                            module: "loantype",
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
                            module: "loantype",
                            user_id: new mongoose.Types.ObjectId(req.session.user_id),
                            reference_id: new mongoose.Types.ObjectId(id),
                            updated_at: formatdate,
                        };
                        await CustomFieldMeta.create(this_data);
                    }
                }
            } else {
                // Get the current date and format it
                // const date = Date.now();
                const formattedDate = moment().format('YYYY-MM-DD');

                // Insert new custom field metadata
                if (req.body.customfields) {
                    for (const [key, value] of Object.entries(req.body.customfields)) {
                        const thisData = {
                            custom_field_id: new mongoose.Types.ObjectId(key),
                            customfield_value: functions.handleInputDateOrValue(value, currentDateFormat),
                            module: 'loantype',
                            user_id: new mongoose.Types.ObjectId(req.session.user_id),
                            reference_id: new mongoose.Types.ObjectId(id),
                            updated_at: formattedDate,
                        };
                        await CustomFieldMeta.create(thisData);
                    }
                }

                // Insert new file custom field metadata
                if (req.files) {
                    for (const [key, value] of Object.entries(req.files)) {
                        const thisData = {
                            custom_field_id: new mongoose.Types.ObjectId(value.fieldname),
                            customfield_value: value.filename,
                            module: 'loantype',
                            user_id: new mongoose.Types.ObjectId(id),
                            reference_id: new mongoose.Types.ObjectId(id),
                            updated_at: formattedDate,
                        };
                        await CustomFieldMeta.create(thisData);
                    }
                }
            }


            req.flash('success', res.__('Loan Type Updated Successfully.'));
            res.redirect('/loan/loantypelist');
        } else {
            const myobj = {
                type: req.body.type,
                loan_desc: req.body.loan_desc,
                loan_min_amount: req.body.loan_min_amount,
                loan_max_amount: req.body.loan_max_amount,
                interestrate: req.body.interestrate,
                latepaymentcharge: req.body.latepaymentcharge,
                processingfee: req.body.processingfee,
                addedby: new mongoose.Types.ObjectId(req.session.user_id),
            };
            console.log('OBJ:', myobj);
            const result = await Loantype.create(myobj);

            // const date = Date(Date.now());
            const formatdate = moment().format("YYYY-MM-DD");

            const activityLog = {
                date: formatdate,
                module: "Loan Type",
                action: "inserted loantype",
                user: new mongoose.Types.ObjectId(req.session.user_id),
                item: req.body.type,
                status: 0,
            };

            await ActivityLog.create(activityLog);

            if (req.body.customfields) {
                for (const [key, value] of Object.entries(req.body.customfields)) {
                    const this_data = {
                        custom_field_id: new mongoose.Types.ObjectId(key),
                        customfield_value: functions.handleInputDateOrValue(value,currentDateFormat),
                        module: "loantype",
                        user_id: new mongoose.Types.ObjectId(req.session.user_id),
                        reference_id: result._id,
                        updated_at: formatdate,
                    };
                    await CustomFieldMeta.create(this_data);
                }
            }

            if (req.files) {
                for (const [key, value] of Object.entries(req.files)) {
                    const this_data = {
                        custom_field_id: new mongoose.Types.ObjectId(value.fieldname),
                        customfield_value: value.filename,
                        module: "loantype",
                        user_id: new mongoose.Types.ObjectId(req.session.user_id),
                        reference_id: result._id,
                        updated_at: formatdate,
                    };
                    await CustomFieldMeta.create(this_data);
                }
            }

            req.flash('success', res.__('Loan Type Inserted Successfully.'));
            res.redirect('/loan/loantypelist');
        }
    } catch (err) {
        console.error(err);
        req.flash('error', res.__('Error occurred.'));
        res.redirect('/loan/loantypelist');
    }
};

exports.getLoanList = async function (req, res, next) {
    try {
        let access_data = [];
        const session_id = req.query.session_id; // Get the session_id from query params
        const failstatus = req.query.status;
        // const stripe = Stripe(req.session.generaldata.stripe_secret_key || '');
        let stripe;
        if (req.session.generaldata?.stripe_secret_key) {
            stripe = require('stripe')(req.session.generaldata.stripe_secret_key);
        }
       
        if (session_id) {
            try {
              
            // Step 1: Verify the session_id from Stripe to check if payment was successful
            const stripesession = await stripe.checkout.sessions.retrieve(session_id);
            if (stripesession.payment_status === "paid") {


                const paymentIntentId = stripesession.payment_intent;
                console.log('paymentIntentId:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::', paymentIntentId);

                // Retrieve payment details using paymentIntentId
                const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
                // you can get via payment intent(id , amount , currency , status);

              // Step 2: Perform your database update logic
              const emi_id = stripesession.metadata.emi_id;
              const loanno = stripesession.metadata.loanno;
              const myquery = { _id: new mongoose.Types.ObjectId(emi_id) };

              // Update the EmiDetails collection with the paid status
              const updateResult = await EmiDetails.updateOne(myquery, {
                $set: { status: 1 , paymentid: paymentIntent.id , paymentamount: paymentIntent.amount/100  , payment_type: paymentIntent.payment_method_types[0]},
              });

              if (updateResult.modifiedCount > 0) {
                console.log("EmiDetails document updated successfully");
              } else {
                console.log("No EmiDetails document found or update failed");
                req.flash(
                  "error",
                  res.__("Failed to update EMI details. Please try again.")
                );
                return res.redirect("/loan/loanlist"); // Stop further execution if update fails
              }
              // Step 3: Delete the session
              // await Session.deleteOne({ session_id: session_id });
              const formatdate = moment().format("YYYY-MM-DD");

              const myobj = {
                date: formatdate,
                module: "EMI",
                action: "updated EMI",
                user: new mongoose.Types.ObjectId(req.session.user_id),
                item: loanno,
                status: 0,
              };

              await ActivityLog.create(myobj);

              const rr = await EmiDetails.findOne(myquery);
              const notificationTemplates = await NotificationTemplate.find({
                templatetitle: "Emi Paid",
              }).lean();

              const result1 = await Users.find(rr.user_id).lean();
              const loandetails = await LoanDetails.findOne(rr.loan_id);
              const typeloans = await Loantype.findOne(loandetails.loantype);
              const remian = await EmiDetails.countDocuments({
                loan_id: rr.loan_id,
                status: 0,
              });
              for (const notification of notificationTemplates) {
                const message = notification.content;
                const subject = notification.subject;

                const Obj = {
                  _USERFIRSTNAME_: result1[0].firstname,
                  _USERLASTNAME_: result1[0].lastname,
                  _LOANTYPE_: typeloans.type,
                  _datetime_: formatdate,
                  _EMI_: remian,
                  _LOANENDDATE_: loandetails.enddate,
                  _newline_: "<br>",
                  _tab_: "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",
                  _systemname_: req.session.generaldata.com_name,
                };

                const trans = message.replace(
                  /_USERFIRSTNAME_|_USERLASTNAME_|_LOANTYPE_|_newline_|_tab_|_EMI_|_systemname_|_datetime_|_LOANSTARTDATE_|_LOANENDDATE_/gi,
                  (matched) => {
                    return Obj[matched];
                  }
                );

                const subtrans = subject.replace(
                  /_USERFIRSTNAME_|_USERLASTNAME_|_LOANTYPE_|_newline_|_tab_|_systemname_/gi,
                  (matched) => {
                    return Obj[matched];
                  }
                );

                await Mail.sendMail(result1[0].email, subtrans, trans);
              }

              // Flash success message and redirect to loan list page
              req.flash("success", res.__("EMI paid successfully."));
              res.redirect("/loan/loanlist");
            } else {
              // If payment wasn't successful, flash an error message
              req.flash(
                "error",
                res.__("Payment not successful. Please try again.")
              );
              res.redirect("/loan/disapprovedloanlist");
            }
          } catch (err) {
            console.error(err);
            req.flash(
              "error",
              res.__(
                "An error occurred while processing your payment. Please try again. error from catch"
              )
            );
            res.redirect("/loan/loanlist");
          }
        }

        if (failstatus) {
            if (failstatus === "failed") {
                req.flash('error', res.__('Payment failed. Please try again.'));
                res.redirect('/loan/loanlist');
            }
        }

        const myquery = { "rolename": req.session.role_slug };
        const access = await AccessRights.find(myquery).lean();

        for (const [key, value] of Object.entries(access)) {
            for (const [key1, value1] of Object.entries(value['access_type'])) {
                if (key1 == "loanlist") {
                    access_data = value1;
                }
            }
        };
        // const role = await Role.findOne({ "rolename": req.session.role_slug }).lean();

        if (req.session.admin_access !== 1) {
            if (req.session.access_rights && req.session.access_rights.loanlist && req.session.access_rights.loanlist.owndata) {
                console.log('access_dataaaaaa', access_data);
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
                const numOfDocs = await LoanDetails.countDocuments(query);
                // const approvedQuery = { $and: [{ status: 1 }, { approvestatus: 1 },{user: new mongoose.Types.ObjectId(req.session.user_id)}] };
                // const disapprovedQuery = { $and: [{ status: 1 }, { approvestatus: 0 },{user: new mongoose.Types.ObjectId(req.session.user_id)}] };

                const approveloan = await LoanDetails.countDocuments(approvedQuery);
                const disapproveloan = await LoanDetails.countDocuments(disapprovedQuery);
                res.render('loan/loanlist', {
                    title: 'Loans',
                    session: req.session,
                    count: numOfDocs,
                    approveloan: approveloan,
                    disapproveloan: disapproveloan,
                    accessrightdata: access_data,
                    messages: req.flash()
                });
            }
        }
        else {
            const numOfDocs = await LoanDetails.countDocuments({ $and: [{ status: 1 }] });
            const approvedQuery = { $and: [{ status: 1 }, { approvestatus: 1 }] };
            const disapprovedQuery = { $and: [{ status: 1 }, { approvestatus: 0 }] };

            const approveloan = await LoanDetails.countDocuments(approvedQuery);
            const disapproveloan = await LoanDetails.countDocuments(disapprovedQuery);
            res.render('loan/loanlist', {
                title: 'Loans',
                session: req.session,
                count: numOfDocs,
                approveloan: approveloan,
                disapproveloan: disapproveloan,
                accessrightdata: access_data,
                messages: req.flash()
            });
        }
    } catch (error) {
        console.log(error)
        next(error);

    }
}

exports.getLoanListDelete = async (req, res) => {
    const id = req.params.id;
    const myquery = { _id: new mongoose.Types.ObjectId(id) };

    const result = await LoanDetails.deleteOne(myquery);
    if (result.deletedCount === 1) {
        res.redirect('/loan/loanlist');
    } else {
        res.status(404).send('Loan not found');
    }
};

exports.getAddLoan = async function (req, res) {
    const languages = lang.getLocale();
    const id = req.params.id;
    let result_data = [];

    if (id) {
        const myquery = { "_id": new mongoose.Types.ObjectId(id) };
        const result = await LoanDetails.find(myquery).lean();
        result_data = result;
        result_data[0].id_d = new mongoose.Types.ObjectId(result_data[0].user).toString();

        const query = { status: 1 };
        // const User_name = await Users.findOne(query);
        const User_name = await Users.find(query).lean();
        for (const [key, value] of Object.entries(User_name)) {
            User_name[key].id_d = new mongoose.Types.ObjectId(value._id).toString();
        }

        const loan_type = await Loantype.find().lean();
        for (const [key, value] of Object.entries(loan_type)) {
            loan_type[key].id_d = new mongoose.Types.ObjectId(value._id).toString();
        }

        const geninfo = await Generalsetting.find().lean();
        for (const [key, value] of Object.entries(geninfo)) {
            geninfo[key].id_d = new mongoose.Types.ObjectId(value._id).toString();
        }

        const mydata = { $and: [{ "module_name": "loan" }, { "field_visibility": 1 }] };
        const customfield = await CustomField.find(mydata).lean();
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

        const notequery = { "module_id": new mongoose.Types.ObjectId(id) };
        const notes = await Notes.find(notequery).lean();

        res.render('loan/addloan', { title: "Edit Loan", data: result_data, id: id, session: req.session, user: User_name, loan: loan_type, geninfo: geninfo, setlang: languages, newfield: customfield, customfield_value: customfield_value, note: notes });
    } else {
        const query = { status: 1 };
        // const User_name = await Users.findOne(query);
        const User_name = await Users.find(query).lean();
        const loan_type = await Loantype.find().lean();
        const geninfo = await Generalsetting.find().lean();
        const mydata = { $and: [{ "module_name": "loan" }, { "field_visibility": 1 }] };
        const customfield = await CustomField.find(mydata).lean();

        for (const [key, value] of Object.entries(geninfo)) {
            User_name[key].id_d = new mongoose.Types.ObjectId(value._id).toString();
        }

        const news = [{ 'userid': '-1' }];
        res.render('loan/addloan', { title: "Add Loan", data: news, session: req.session, user: User_name, loan: loan_type, geninfo: geninfo, newfield: customfield, note: news });
    }
}

exports.postAddLoan = async (req, res) => {

    try {
        const id = req.body.id;
        const data = [];
        let attachfiles = [];
        // const addnote = [];
        let i = 0;
        let currentDateFormate = functions.formatDatesToGeneralData(req.session.generaldata.date_format);

        // Notes and Attach file start
        // const note = req.body.note;
        // if (Array.isArray(note)) {
        //     addnote.push(...note);
        // } else {
        //     addnote.push(note);
        // }
        const note = req.body.note;
        let addnote = [];

        if (Array.isArray(note)) {
            addnote = req.body.note;
        } else {
            addnote.push(note);
        }

        const doc = req.body.doc_old;
        if (doc !== undefined) {
            const docsArray = Array.isArray(doc) ? doc : [doc];
            data.push(...docsArray);

        }

        for (const [keys1, values1] of Object.entries(req.files)) {
            if (values1.fieldname === 'document') {
                const docs = values1.filename;
                data.push(docs);
                i++;
            }
        }

        // const atimg = req.body.attachfile_old;
        // if (atimg !== undefined) {
        //     const attachArray = Array.isArray(atimg) ? atimg : [atimg];
        //     attachfiles.push(...attachArray);
        // }

        // for (const [keys, values] of Object.entries(req.files)) {
        //     if (values.fieldname === 'attachfile') {
        //         const attach = values.filename;
        //         attachfiles.push(attach);
        //         j++;
        //     }
        // }
        // if (req.body.attachfile_old !== undefined) {
        //     if (Array.isArray(req.body.attachfile_old)) {
        //         attachfiles.push(...req.body.attachfile_old);
        //     } else {
        //         attachfiles.push(req.body.attachfile_old);
        //     }
        // }

        // for (const [keys, values] of Object.entries(req.files)) {
        //     if (values.fieldname === 'attachfile') {
        //         const attach = values.filename;
        //         attachfiles.push(attach);
        //     }
        // }
        const atimg = req.body.attachfile_old;
        if (atimg !== undefined) {
            if (Array.isArray(atimg)) {
                attachfiles = req.body.attachfile_old;
            } else {
                attachfiles.push(atimg);
            }
        }
        for (const [key, values] of Object.entries(req.files)) {
            if (values.fieldname === "attachfile") {
                const attach = values.filename;
                attachfiles.push(attach);
            }
        }

        if (id) {
            console.log(req.body.years)
            const myquery = { "_id": new mongoose.Types.ObjectId(id) };
            const datas = await LoanDetails.find(myquery).lean();
            const existingLoan = await LoanDetails.findOne(datas[0]._id);
      
            const userid = req.body.user;
            const loanid = req.body.loantype;
            const iduser = new mongoose.Types.ObjectId(userid);
            const idloan = new mongoose.Types.ObjectId(loanid);
            
            // const st = momenet(req.body.startdate).format("YYYY-MM-DD");
            // const startdate = moment(req.body.startdate).format("YYYY-MM-DD");
            // const enddate = moment(req.body.enddate).format("YYYY-MM-DD");
            // const startdate = moment(req.body.startdate, ['DD-MM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD']).format("YYYY-MM-DD");
            // const enddate = moment(req.body.enddate, ['DD-MM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD']).format("YYYY-MM-DD");
            const startdate = moment(req.body.startdate, currentDateFormate).format("YYYY-MM-DD");
            const enddate = moment(req.body.enddate, currentDateFormate).format("YYYY-MM-DD");
            console.log(startdate, "--------------------------", enddate)

            const savedLoan = await LoanDetails.findByIdAndUpdate(
                { "_id": new mongoose.Types.ObjectId(id) },
                {
                    loancount: req.body.loancount,
                    loantype: idloan,
                    user: iduser,
                    description: req.body.description,
                    document: data,
                    loanamount: req.body.loanamount,
                    interestrate: req.body.interestrate,
                    years: req.body.years,
                    startdate: startdate,
                    enddate: enddate,
                    totalemimonth: req.body.totalemimonth,
                    processingfee: req.body.processingfee,
                    incomeperyear: req.body.incomeperyear,
                    incomepermonth: req.body.incomepermonth,
                    oincome: req.body.oincome,
                    workdetail: req.body.workdetail,
                    colleague: req.body.colleague,
                    address: req.body.address,
                    mobile: req.body.mobile,
                    addtype: req.body.addtype,
                    othertext: req.body.othertext,
                    createdby: new mongoose.Types.ObjectId(req.session.user_id),
                },
            );

            // console.log('1', existingLoan.totalemimonth);
            // console.log('2', req.body.totalemimonth);
            // Check if any of the relevant parameters have changed
            const loanParametersChanged =
                existingLoan.startdate !== startdate ||
                existingLoan.totalemimonth !== req.body.totalemimonth ||
                existingLoan.loanamount !== req.body.loanamount ||
                existingLoan.interestrate !== req.body.interestrate;
            console.log('result--', loanParametersChanged);
            if (loanParametersChanged) {
                // console.log("Loan Parameters Changed");
                // Recalculate and update EMI details
                await EmiDetails.deleteMany({ loan_id: existingLoan._id });
                const mortgage = AmortizeJS.calculate({
                    method: 'mortgage',
                    apr: req.body.interestrate,
                    balance: req.body.loanamount,
                    loanTerm: req.body.totalemimonth,
                    startDate: req.body.startdate,
                });
                // console.log('Mortgage Schedule:', mortgage.schedule);

                const emiData = [];
                let index_id = 1;
                mortgage.schedule.forEach((element) => {
                    const datefr = moment(element.date).format("YYYY-MM-DD");
                    const monthly_payment = mortgage.periodicPayment;
                    const totalpayment = element.interest + element.principal;
                    const emiDetails = {
                        loan_id: existingLoan._id,
                        user_id: iduser,
                        month: index_id,
                        interest: element.interest,
                        principal: element.principal,
                        totalpayment: totalpayment,
                        remainingBalance: element.remainingBalance,
                        monthly_payment: monthly_payment,
                        date: datefr,
                        status: 0,
                        mail_noti: 0,
                    };
                    index_id++;
                    console.log(emiDetails)
                    emiData.push(emiDetails);
                });
                // console.log('EMI Data:', emiData);
                // Delete existing EMI details and insert the new ones
                await EmiDetails.insertMany(emiData);
            }

            // const date = Date(Date.now());
            // const formatdate = moment(date, 'YYYY-MM-DD').format("YYYY-MM-DD");
            const date1 = moment().format('YYYY-MM-DD');
            const myobj = {
                date: date1,
                module: "Loan",
                action: "updated loan no.",
                user: new mongoose.Types.ObjectId(req.session.user_id),
                item: req.body.loancount,
                status: 0,
            };

            await ActivityLog.create(myobj);

            // const noteQuery = { "module": "loan" };
            // const notedata = Notes.find(noteQuery).lean();
            const notequery = { "module_id": new mongoose.Types.ObjectId(id) };
            const noteData = await Notes.find(notequery).lean();
            console.log(noteData);
            if (noteData.length > 0) {
                for (const value of noteData) {
                    const nquery = { "_id": new mongoose.Types.ObjectId(value._id) };
                    // console.log(nquery);
                    if (req.body.note || req.files) {
                        const this_data = {
                            $set: {
                                note: addnote, // Assuming addnote is supposed to be req.body.note
                                fileattach: attachfiles, // Assuming attachfiles is supposed to be file
                            },
                        };
                        await Notes.findByIdAndUpdate(nquery, this_data);
                    }
                }
            }
            else {
                if (req.files && note) {
                    const notes = new Notes({
                        note: addnote,
                        fileattach: attachfiles,
                        module: "loan",
                        module_id: savedLoan._id
                    });

                    await notes.save();
                }
            }


            const query = { "reference_id": new mongoose.Types.ObjectId(id) };
            const metadata = await CustomFieldMeta.find(query).lean();

            if (metadata.length > 0) {
                // const date = new Date();
                const formatdate = moment().format("YYYY-MM-DD");

                if (req.body.customfields) {
                    for (const [keys, values] of Object.entries(metadata)) {
                        const findquery = { "_id": values.custom_field_id };
                        const finddata = await CustomField.find(findquery).lean();
                        // console.log("FindData", finddata);
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
                            module: "loan",
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
                        const query1 = { _id: values._id };
                        const field = new mongoose.Types.ObjectId(values.custom_field_id).toString();
                        if (value.fieldname == field) {
                            // Do nothing
                        } else {
                            if (values._id) {
                                m++;

                            }
                        }
                        if (m > 0) {
                            const this_data = {
                                custom_field_id: new mongoose.Types.ObjectId(value.fieldname),
                                customfield_value: value.filename,
                                module: "loan",
                                user_id: new mongoose.Types.ObjectId(req.session.user_id),
                                reference_id: new mongoose.Types.ObjectId(id),
                                updated_at: formatdate,
                            };
                            await CustomFieldMeta.create(this_data);
                        }
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
                            module: "loan",
                            user_id: new mongoose.Types.ObjectId(req.session.user_id),
                            reference_id: new mongoose.Types.ObjectId(id),
                            updated_at: formatdate,
                        };
                        await CustomFieldMeta.create(this_data);
                    }
                }

                if (req.files) {
                    for (const [key, value] of Object.entries(req.files)) {
                        const this_data = {
                            custom_field_id: new mongoose.Types.ObjectId(value.fieldname),
                            customfield_value: value.filename,
                            module: "loan",
                            user_id: new mongoose.Types.ObjectId(req.session.user_id),
                            reference_id: new mongoose.Types.ObjectId(id),
                            updated_at: formatdate,
                        };
                        await CustomFieldMeta.create(this_data);
                    }
                }
            }


            const typeloans = await Loantype.find({ "_id": idloan }).lean();

            const myobj1 = {
                action: "Loan Updated",
                desc: "is updated",
                loan: new mongoose.Types.ObjectId(id),
                user: iduser,
                userby: new mongoose.Types.ObjectId(req.session.user_id),
                Name: typeloans[0].type,
                date: date1,
                status: 1
            };

            const noquery = { "user": new mongoose.Types.ObjectId(req.session.user_id) };
            const querys = { $and: [{ status: 1 }, { "user": new mongoose.Types.ObjectId(req.session.user_id) }] };
            console.log("Query for activenoti:", JSON.stringify(querys, null, 2));

            await NotificationBadges.create(myobj1);
        const notiresult = await NotificationBadges.find(noquery).sort({ createdAt: -1 }).lean();
            const adminnoti = await NotificationBadges.find().sort({ createdAt: -1 }).lean();
            const activenoti = await NotificationBadges.countDocuments(querys);
            const adminnoticount = await NotificationBadges.countDocuments({});

            if (req.session.admin_access == 1) {
               req.session.noti = adminnoti;
                req.session.noticount = adminnoticount;
            } else {
                req.session.noti = notiresult;
                req.session.noticount = activenoti;
            }
            const resultes = await LoanDetails.find({ "_id": new mongoose.Types.ObjectId(id) }).lean();
     
            if (resultes[0].approvestatus == 1) {
                req.flash('success', res.__('Loan Updated Successfully.'));
                res.redirect('/loan/loanlist');
            }
            else {
   
                req.flash('success', res.__('Loan Updated Successfully.'));
                res.redirect('/loan/disapproveloan');
            }
            // req.flash('success', 'Loan Updated Successfully.');
            // res.redirect('/loan/loanlist');

        } else { // add new loan
            const userid = req.body.user;
            const iduser = new mongoose.Types.ObjectId(userid);
            const type = req.body.loantype;
            const loantype = new mongoose.Types.ObjectId(type);
            const startdate = moment(req.body.startdate, currentDateFormate).format("YYYY-MM-DD");
            const enddate = moment(req.body.enddate, currentDateFormate).format("YYYY-MM-DD");
          

            const myLoan = {
                loancount: req.body.loancount,
                loantype: loantype,
                user: iduser,
                description: req.body.description,
                document: data,
                loanamount: req.body.loanamount,
                interestrate: req.body.interestrate,
                years: req.body.years,
                startdate: startdate,
                enddate: enddate,
                totalemimonth: req.body.totalemimonth,
                processingfee: req.body.processingfee,
                incomeperyear: req.body.incomeperyear,
                incomepermonth: req.body.incomepermonth,
                oincome: req.body.oincome,
                workdetail: req.body.workdetail,
                colleague: req.body.colleague,
                address: req.body.address,
                mobile: req.body.mobile,
                addtype: req.body.addtype,
                othertext: req.body.othertext,
                status: 1,
                approvestatus: 0,
                createdby: new mongoose.Types.ObjectId(req.session.user_id),
            };
            const resultes = await LoanDetails.create(myLoan);
            // const date = Date(Date.now());
            // const formatdate = moment(date,).format("YYYY-MM-DD");
            const date1 = moment().format('YYYY-MM-DD');
            const activityLog = new ActivityLog({
                date: date1,
                module: "Loan",
                action: "added loan no.",
                user: new mongoose.Types.ObjectId(req.session.user_id),
                item: req.body.loancount,
                status: 0,
            });
            await activityLog.save();

            // const result = await Users.findOne(iduser);
            const result = await Users.find(iduser).lean();
            const notificationTemplates = await NotificationTemplate.find({ templatetitle: "Loan Add" }).lean();
            const typeloans = await Loantype.find(loantype).lean();

            for (const notification of notificationTemplates) {
                const message = notification.content;
                const subject = notification.subject;

                const Obj = {
                    '_USERFIRSTNAME_': result[0].firstname,
                    '_USERLASTNAME_': result[0].lastname,
                    '_LOANTYPE_': typeloans[0].type,
                    '_datetime_': date1,
                    '_LOANSTARTDATE_': startdate,
                    '_LOANENDDATE_': enddate,
                    '_newline_': '<br>',
                    '_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
                    '_systemname_': req.session.generaldata.com_name,
                };

                const trans = message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_LOANTYPE_|_newline_|_tab_|_systemname_|_datetime_|_LOANSTARTDATE_|_LOANENDDATE_/gi, (matched) => {
                    return Obj[matched];
                });

                const subtrans = subject.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_LOANTYPE_|_newline_|_tab_|_systemname_/gi, (matched) => {
                    return Obj[matched];
                });

                await Mail.sendMail(result[0].email, subtrans, trans);
            }

            const mortgage = AmortizeJS.calculate({
                method: 'mortgage',
                apr: req.body.interestrate,
                balance: req.body.loanamount,
                loanTerm: req.body.totalemimonth,
                startDate: startdate,
            });

            const emiData = [];
            let index_id = 1;
            mortgage.schedule.forEach((element) => {
                const datefr = moment(element.date).format("YYYY-MM-DD");
                const totalpayment = element.interest + element.principal;
                const monthly_payment = mortgage.periodicPayment;

                const emiDetails = {
                    loan_id: resultes._id,
                    user_id: iduser,
                    month: index_id,
                    interest: Math.round(element.interest),
                    principal: Math.round(element.principal),
                    totalpayment: Math.round(totalpayment),
                    remainingBalance: Math.round(element.remainingBalance),
                    monthly_payment: Math.round(monthly_payment),
                    date: datefr,
                    status: 0,
                    mail_noti: 0,
                };
                index_id++;
                emiData.push(emiDetails);
            });

            await EmiDetails.insertMany(emiData);

            if (req.body.customfields) {
                for (const [key, value] of Object.entries(req.body.customfields)) {
                    const customFieldMeta = new CustomFieldMeta({
                        custom_field_id: new mongoose.Types.ObjectId(key),
                        customfield_value: value,
                        module: "loan",
                        user_id: new mongoose.Types.ObjectId(req.session.user_id),
                        reference_id: resultes._id,
                        updated_at: date1,
                    });
                    await customFieldMeta.save();
                }
            }

            if (req.files) {
                for (const [key, value] of Object.entries(req.files)) {
                    if (value.fieldname !== "document" && value.fieldname !== "attachfile") {
                        const customFieldMeta = new CustomFieldMeta({
                            custom_field_id: new mongoose.Types.ObjectId(value.fieldname),
                            customfield_value: value.filename,
                            module: "loan",
                            user_id: new mongoose.Types.ObjectId(req.session.user_id),
                            reference_id: resultes._id,
                            updated_at: date1,
                        });
                        await customFieldMeta.save();
                    }
                }
            }
            if (req.files && note) {
                const notes = new Notes({
                    note: addnote,
                    fileattach: attachfiles,
                    module: "loan",
                    module_id: resultes._id
                });

                await notes.save();
            }


            const loanTypeResult = await Loantype.find(loantype).lean();
            const notificationBadge = new NotificationBadges({
                action: "New Loan Added",
                desc: "is added ",
                loan: resultes._id,
                user: iduser,
                userby: new mongoose.Types.ObjectId(req.session.user_id),
                Name: loanTypeResult[0].type,
                date: date1,
                status: 1,
            });
            await notificationBadge.save();

            const noquery = { "user": new mongoose.Types.ObjectId(req.session.user_id) };
            const query = { $and: [{ status: 1 }, { "user": new mongoose.Types.ObjectId(req.session.user_id) }] };

            const notiResult = await NotificationBadges.find(noquery).sort({ createdAt: -1 }).lean();
            const adminNotiResult = await NotificationBadges.find().sort({ createdAt: -1 }).lean();
            const activenoti = await NotificationBadges.countDocuments(query);
            const adminnoticount = await NotificationBadges.countDocuments({});

            if (req.session.admin_access == 1) {
                req.session.noti = adminNotiResult;
                req.session.noticount = adminnoticount;
            } else {
                req.session.noti = notiResult;
                req.session.noticount = activenoti;
            }

            req.flash('success', res.__('Loan Inserted Successfully.'));
            res.redirect('/loan/disapproveloan');
        }
    } catch (error) {
        req.flash('error', res.__('Error occurred.'));
        // res.redirect('/loan/loanlist');
    }
};

exports.getDisapproveLoanCountList = async (req, res) => {
    try {
        let access_data = [];
        const access = await AccessRights.find({ "rolename": req.session.role_slug }).lean();
        for (const [key, value] of Object.entries(access)) {

            for (const [key1, value1] of Object.entries(value['access_type'])) {
                if (key1 == "disapproveloanlist") {
                    access_data = value1;
                }
            }
        };
        if (req.session.admin_access !== 1) {
            if (req.session.access_rights && req.session.access_rights.disapproveloanlist && req.session.access_rights.disapproveloanlist.owndata) {
                const role = await Role.findOne({ _id: req.session.role });
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
                const numOfDocs = await LoanDetails.countDocuments(query);

                const approveloan = await LoanDetails.countDocuments(approvedQuery);

                const disapproveloan = await LoanDetails.countDocuments(disapprovedQuery);
                const userRole = req.session.role;
                res.render('loan/disapproveloan', {
                    title: 'Disapproved Loans',
                    count: numOfDocs,
                    approveloan: approveloan,
                    disapproveloan: disapproveloan,
                    session: req.session,
                    messages: req.flash(),
                    accessrightdata: access_data,
                    role: userRole,
                });
            }
        } else {
            const numOfDocs = await LoanDetails.countDocuments({ $and: [{ status: 1 }] });

            const approveloan = await LoanDetails.countDocuments({ $and: [{ status: 1 }, { approvestatus: 1 }] });

            const disapproveloan = await LoanDetails.countDocuments({ $and: [{ status: 1 }, { approvestatus: 0 }] });
            res.render('loan/disapproveloan', {
                title: 'Disapproved Loans',
                count: numOfDocs,
                approveloan: approveloan,
                disapproveloan: disapproveloan,
                session: req.session,
                messages: req.flash(),
                accessrightdata: access_data,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getDisapproveLoanList = async (req, res) => {
    try {
        const disapprovedLoans = await LoanDetails.find({ status: 0 }).lean();
        console.log(disapprovedLoans);
        res.json(disapprovedLoans);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getDisapproveLoanDelete = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await LoanDetails.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
        if (result.deletedCount === 1) {
            res.redirect('/loan/loan_details');
        } else {
            res.json(false);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getViewLoan = async (req, res) => {
    try {
        const id = req.params.id;

        if (id) {
            const result = await LoanDetails.find({ "_id": new mongoose.Types.ObjectId(id) }).lean();
            // result_data = result;
            const approvedstatus = result[0].approvestatus;
            // result_data[0].id_d = new mongoose.Types.ObjectId(result_data[0].user).toString();

            const loanquery = { "_id": result[0].loantype };
            const query = { "_id": result[0].user };
            const loanid = { "loan_id": new mongoose.Types.ObjectId(id) };

            const [result1, typeofloan, repayment, emilist] = await Promise.all([
                // Users.findOne(query),
                Users.find(query).lean(),
                Loantype.find(loanquery).lean(),
                Repayment.find().lean(),
                EmiDetails.find(loanid).lean()
            ]);
            for (const [key, value] of Object.entries(result1)) {
                result1[key].id_d = new mongoose.Types.ObjectId(value._id).toString();
            }
            for (const [key, value] of Object.entries(typeofloan)) {
                typeofloan[key].id_d = new mongoose.Types.ObjectId(value._id).toString();
            }
            var notificationtype = 'upcoming_emi';
            const alert_data = [];

            const reminder = await Reminder.find({reminder_type: notificationtype}).limit(1).lean();
            for (const [keys, values_n] of Object.entries(reminder)) {
                var befor_after = values_n.reminder_will_send;
                const reminder_template = values_n.reminder_template;
      
                for (const [keys, values1] of Object.entries(values_n.reminderdata)) {
                    var number_day = values1.number;
                }
            }
            let add_date;
      if (befor_after === 'Before') {
          add_date = moment().add(number_day, 'd');
      } else {
          add_date = moment().subtract(number_day, 'd');
      }
      add_date = moment(add_date).format('YYYY-MM-DD');
      const result2 = await EmiDetails.aggregate([
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
                $and: [{
                    loan_id:new mongoose.Types.ObjectId(id),
                    status: 0,
                    date: add_date,
                }]
            }
        }
    ])
    for (const value1 of result2) {
        if (value1.loan.approvestatus == 1 || value1.loan.status == 0) {
            alert_data.push(value1);
        }
            }
            // const emiChangeDateFormate = emilist.map((emi) => {
            //    emi.date = functions.getdate(emi.daate, req.session.generaldata.date_format);
            //     return emi
            // })
           
            console.log("data =", result[0]['approvestatus']);
            res.render('loan/viewloan', {
                title: "View Loan",
                emi: emilist,
                type: typeofloan,
                approve: result[0]['approvestatus'],
                repayment: repayment,
                data: result,
                user: result1,  
                id: id,
                session: req.session,
                alert_data: alert_data,
                approvedstatus: approvedstatus
            });
        
       
        } else {
            const news = [{ 'userid': '-1' }];
            res.render('loan/viewloan', { title: "View Loan", data: news, family: news, session: req.session });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

exports.getEmiDetails = async (req, res) => {
    
    const id = req.params.id;

    if (id) {
        try {
            const result_data = await EmiDetails.find({ _id: new mongoose.Types.ObjectId(id) }).lean();
            const loanlist = await LoanDetails.find({ _id: result_data[0].loan_id }).lean();
            const typeofloan = await Loantype.find({ _id: loanlist[0].loantype }).lean();
            const customfield = await CustomField.find({ $and: [{ 'module_name': 'emi' }, { 'field_visibility': 1 }] }).lean();

            const usersrole = await Role.findOne({ _id: new mongoose.Types.ObjectId(req.session.role) }).lean();
            const rolename = usersrole.role_slug;

            for (const [key, value] of Object.entries(customfield)) {
                customfield.forEach(element => {
                    customfield[key].id_d = new mongoose.Types.ObjectId(value._id).toString();
                });
            }
            const customfield_value = await CustomFieldMeta.find({ "reference_id": new mongoose.Types.ObjectId(id) });
            for (const [key, value] of Object.entries(customfield_value)) {
                customfield_value[key].id_d = new mongoose.Types.ObjectId(value.custom_field_id).toString();
            }
           
            res.render('loan/addemi', { title: 'Add EMI', loan: loanlist, data: result_data, type: typeofloan, id: id, session: req.session, newfield: customfield, customfield_value: customfield_value, stripePublishableKey: req.session.generaldata.stripe_publishable_key , role:rolename});
            console.log("loan approval=",loanlist[0]['approvestatus']);
            // res.render('loan/addemi', { title: 'Add EMI', loan: loanlist, data: result_data, type: typeofloan, id: id, session: req.session, newfield: customfield, customfield_value: customfield_value });
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    } else {
        const news = [{ 'userid': '-1' }];
        try {
            const customfield = await CustomField.find({ $and: [{ 'module_name': 'emi' }, { 'field_visibility': 1 }] }).lean();
            res.render('loan/addemi', { title: 'Add EMI', data: news, family: news, session: req.session, newfield: customfield, stripePublishableKey: req.session.generaldata.stripe_publishable_key });
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    }
}

exports.postEmiDetails = async (req, res) => {
    const id = req.body.id;
    const myquery = { '_id': new mongoose.Types.ObjectId(id) };

    if (id) {
        try {
            const newvalues = {
                $set: {
                    payment_type: req.body.payment_type,
                    cheque_name: req.body.cheque_name,
                    cheque_accountno: req.body.cheque_accountno,
                    cheque_date: req.body.cheque_date,
                    paymentamount: req.body.paymentamount,
                    status: 1,
                    addedby: new mongoose.Types.ObjectId(req.session.user_id),
                },
            };

            const result = await EmiDetails.updateOne(myquery, newvalues);

            // const date = Date(Date.now());
            const formatdate = moment().format('YYYY-MM-DD');

            const myobj = {
                date: formatdate,
                module: 'EMI',
                action: 'updated EMI',
                user: new mongoose.Types.ObjectId(req.session.user_id),
                item: req.body.loancount,
                status: 0,
            };

            await ActivityLog.create(myobj);

            if (req.body.customfields) {
                for (const [key, value] of Object.entries(req.body.customfields)) {
                    const this_data = {
                        custom_field_id: new mongoose.Types.ObjectId(key),
                        customfield_value: value,
                        module: 'emi',
                        user_id: new mongoose.Types.ObjectId(req.session.user_id),
                        reference_id: result._id,
                        updated_at: formatdate,
                    };
                    await CustomFieldMeta.create(this_data);
                }
            }

            if (req.files) {
                for (const [key, value] of Object.entries(req.files)) {
                    const this_data = {
                        custom_field_id: new mongoose.Types.ObjectId(value.fieldname),
                        customfield_value: value.filename,
                        module: 'emi',
                        user_id: new mongoose.Types.ObjectId(req.session.user_id),
                        reference_id: result._id,
                        updated_at: formatdate,
                    };
                    await CustomFieldMeta.create(this_data);
                }
            }
            const rr = await EmiDetails.findOne(myquery);
            const notificationTemplates = await NotificationTemplate.find({ templatetitle: "Emi Paid" }).lean();
            const result1 = await Users.find(rr.user_id).lean();
            const loandetails = await LoanDetails.findOne(rr.loan_id);
            const typeloans = await Loantype.findOne(loandetails.loantype);
            const remian = await EmiDetails.countDocuments({
                loan_id: rr.loan_id,
                status: 0,
            });
            console.log(remian);
            console.log("rr", result1)
            for (const notification of notificationTemplates) {
                const message = notification.content;
                const subject = notification.subject;

                const Obj = {
                    '_USERFIRSTNAME_': result1[0].firstname,
                    '_USERLASTNAME_': result1[0].lastname,
                    '_LOANTYPE_': typeloans.type,
                    '_datetime_': formatdate,
                    '_EMI_': remian,
                    '_LOANENDDATE_': loandetails.enddate,
                    '_newline_': '<br>',
                    '_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
                    '_systemname_': req.session.generaldata.com_name,
                };

                const trans = message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_LOANTYPE_|_newline_|_tab_|_EMI_|_systemname_|_datetime_|_LOANSTARTDATE_|_LOANENDDATE_/gi, (matched) => {
                    return Obj[matched];
                });

                const subtrans = subject.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_LOANTYPE_|_newline_|_tab_|_systemname_/gi, (matched) => {
                    return Obj[matched];
                });
                console.log('trans: ', trans);
                console.log('subtrans: ', subtrans);
                await Mail.sendMail(result1[0].email, subtrans, trans);
            }

            req.flash('success', res.__('Emi paid successfully.'));
            res.redirect('/loan/loanlist');
        } catch (err) {
            console.error(err);
            req.flash('error', res.__('Error occurred.'));
            res.redirect('/loan/loanlist');
        }
    }};

exports.getRepayment = async (req, res) => {
    try {
        const id = req.params.id;
        const result_data = await Repayment.find({ _id: new mongoose.Types.ObjectId(id) }).lean();
        res.render('loan/repayment', { title: "Add Re_Payments", data: result_data, id: id, session: req.session });
    } catch (err) {
        throw err;
    }
}

exports.postRepayment = async (req, res) => {
    try {
        const newRePayment = new Repayment({
            payment_type: req.body.payment_type,
            repayments: req.body.repayments,
            repaymentamount: req.body.repaymentamount,
            cheque_name: req.body.cheque_name,
            cheque_accountno: req.body.cheque_accountno,
            cheque_date: req.body.cheque_date,
            date: req.body.date,
            addedby: new mongoose.Types.ObjectId(req.session.user_id),
        });
 
        await newRePayment.save();
        req.flash('success', res.__('Extra Re_payments Successfully.'));
        res.redirect('/loan/loanlist');
    } catch (err) {
        console.log(err)
        req.flash('error', res.__('Error occurred.'));
        res.redirect('/loan/loanlist');
    }
}

exports.getTotalLoanCountList = async (req, res) => {
    try {
        let access_data = [];
        const access = await AccessRights.find({ "rolename": req.session.role_slug }).lean();
        for (const [key, value] of Object.entries(access)) {

            for (const [key1, value1] of Object.entries(value['access_type'])) {
                if (key1 == "totalloanlist") {
                    access_data = value1;
                }
            }
        };
        if (req.session.admin_access !== 1) {
            if (req.session.access_rights && req.session.access_rights.totalloanlist && req.session.access_rights.totalloanlist.owndata) {
                const role = await Role.findOne({ _id: req.session.role });
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
                const numOfDocs = await LoanDetails.countDocuments(query);

                const approveloan = await LoanDetails.countDocuments(approvedQuery);

                const disapproveloan = await LoanDetails.countDocuments(disapprovedQuery);

                res.render('loan/totalloans', {
                    title: 'All Loans',
                    count: numOfDocs,
                    approveloan: approveloan,
                    disapproveloan: disapproveloan,
                    session: req.session,
                    messages: req.flash(),
                    accessrightdata: access_data,
                });
            }
        } else {
            const numOfDocs = await LoanDetails.countDocuments({ $and: [{ status: 1 }] });

            const approveloan = await LoanDetails.countDocuments({ $and: [{ status: 1 }, { approvestatus: 1 }] });

            const disapproveloan = await LoanDetails.countDocuments({ $and: [{ status: 1 }, { approvestatus: 0 }] });

            res.render('loan/totalloans', {
                title: 'All Loans',
                count: numOfDocs,
                approveloan: approveloan,
                disapproveloan: disapproveloan,
                session: req.session,
                messages: req.flash(),
                accessrightdata: access_data,
            });

        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getTotalLoanList = async (req, res) => {
    try {
        const totalLoans = await LoanDetails.find().lean();
        console.log(totalLoans);
        res.json(totalLoans);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getTotalLoanDelete = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await LoanDetails.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
        if (result.deletedCount === 1) {
            res.redirect('/loan/totalloans');
        } else {
            res.json(false);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getPendingEMI = async (req, res) => {
    try {
        const date = moment().format("YYYY-MM-DD");
        let query;
        if (req.session.admin_access !== 1) {
            if (req.session.access_rights && req.session.access_rights.pendingemilist && req.session.access_rights.pendingemilist.owndata) {
                const role = await Role.findOne({ _id: req.session.role });
                if (role.role_nm == "Staff") {
                    query = {
                        $and: [{
                            date: {
                                $lt: date
                            }
                        }, {
                            status: 0, createdby: new mongoose.Types.ObjectId(req.session.user_id)
                        }]
                    };
                }
                else {
                    query = {
                        $and: [{
                            date: {
                                $lt: date
                            }
                        }, {
                            status: 0, user_id: new mongoose.Types.ObjectId(req.session.user_id)
                        }]
                    };
                }
                console.log("own data");
            }
        } else {
            query = {
                $and: [{
                    date: {
                        $lt: date
                    }
                }, {
                    status: 0
                }]
            };
            console.log("no data")
        };
        const emiDetails = await EmiDetails.aggregate([
            {
                $lookup: {
                    from: LoanDetails.collection.name,
                    localField: "loan_id",
                    foreignField: "_id",
                    as: "loan"
                }
            },
            {
                $unwind: "$loan"
            },
            {
                $lookup: {
                    from: Users.collection.name,
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $lookup: {
                    from: LoanDetails.collection.name,
                    localField: "loan_id",
                    foreignField: "_id",
                    as: "loanDetails"
                }
            },
            {
                $unwind: "$loanDetails"
            },
            {
                $addFields: {
                    "createdby": "$loanDetails.createdby"
                }
            },
            {
                $match: query
            }
        ]);
        console.log(emiDetails)
        res.render('loan/loanreports', {
            title: 'Loans',
            session: req.session,
            data: emiDetails
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}