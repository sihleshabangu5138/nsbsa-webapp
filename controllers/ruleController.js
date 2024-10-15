const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Rule = require('../models/Rule');
const Generalsetting = require('../models/GeneralSetting');
const CustomField = require('../models/Customfields');
const CustomFieldMeta = require('../models/CustomFieldMeta');
const AccessRights = require('../models/AccessRights');
const moment = require('moment');
const ActivityLog = require('../models/Activitylog');
exports.getRulesList = async (req, res, next) => {
  try {
    const myquery = { "rolename": req.session.role_slug };
    let access_data = [];

    const access = await AccessRights.find(myquery).lean();

    for (const [key, value] of Object.entries(access)) {
      for (const [key1, value1] of Object.entries(value['access_type'])) {
        if (key1 == "rulesandregulation") {
          access_data = value1;
        }
      }
    }
    res.render('rule/rules', { title: 'Rules', session: req.session, messages: req.flash(), accessrightdata: access_data });
  } catch (err) {
    console.error(err);
    return next(err);
  }
}
exports.getRulesDelete = async (req, res, next) => {
  try {
    const id = req.params.id;
    await Rule.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    res.redirect('/rule/rules');
  } catch (err) {
    console.error(err);
    next(err);
  }
}

exports.getAddRule = async (req, res) => {
  // res.status(200).send(`OK:${new mongoose.Types.ObjectId(id)}`);
  try {
    const id = req.params.id;
    if (id) {
      console.log(id);
      const result = await Rule.find({ "_id": new mongoose.Types.ObjectId(id) }).lean();
      const geninfo = await Generalsetting.find().lean();
      const customfields = await CustomField.find({ $and: [{ "module_name": "rule" }, { "field_visibility": 1 }] }).lean();
      for (const customfield of customfields) {
        customfield.id_d = new mongoose.Types.ObjectId(customfield._id).toString();
      }
      const customfield_values = await CustomFieldMeta.find({ "reference_id": new mongoose.Types.ObjectId(id) }).lean();

      for (const customfield_value of customfield_values) {
        customfield_value.id_d = new mongoose.Types.ObjectId(customfield_value.custom_field_id).toString();
      }
      res.render('rule/addrule', { title: "Edit Rule", data: result, id: new mongoose.Types.ObjectId(id), session: req.session, geninfo: geninfo, newfield: customfields, customfield_value: customfield_values });
    } else {
      const news = [{ 'userid': '-1' }];
      const customfield = await CustomField.find({ module_name: 'rule', field_visibility: 1 }).lean();

      res.render('rule/addrule', { title: "Add Rule", data: news, session: req.session, newfield: customfield });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}
// exports.postAddRule = async (req, res) => {
//   console.log(req.body); // Log other form fields
//   console.log(req.file); // Log information about the uploaded file

//   }
exports.postAddRule = async (req, res) => {
  const id = req.body.id;
  console.log(id)
  let uploadimg = [];
  const upimg = req.body.image_old;

  if (upimg !== undefined) {
    if (Array.isArray(upimg)) {
      uploadimg = req.body.image_old;
    } else {
      uploadimg.push(upimg);
    }
  }

  for (const [keys, values] of Object.entries(req.files)) {
    if (values.fieldname === "rule_image" && values.originalname !== "") {
      const img = values.filename;
      uploadimg.push(img);
    }
  }
  try {
    if (id) {
      const myquery = { "_id": new mongoose.Types.ObjectId(id) };
      console.log('UP:', myquery);
      const newvalues = {

        loantype: req.body.loantype,
        rule_title: req.body.rule_title,
        rule_desc: req.body.rule_desc,
        loan_amount_rule: req.body.loan_amount_rule,
        addedby: new mongoose.Types.ObjectId(req.session.user_id),

        // rule_image: uploadimg,
      };
      if (uploadimg.length > 0) {
        newvalues.rule_image = uploadimg;
      }

      console.log('UPDATA:', newvalues);
      await Rule.updateOne(myquery, newvalues);


      const formatdate = moment().format("YYYY-MM-DD");
      const activityLog = new ActivityLog({
        date: formatdate,
        module: "Rule",
        action: "updated",
        user: new mongoose.Types.ObjectId(req.session.user_id),
        item: req.body.loantype,
        status: 0
      });
      await activityLog.save();

      const query = { "reference_id": new mongoose.Types.ObjectId(id) };
      const metadata = await CustomFieldMeta.find(query).lean();

      if (metadata.length > 0) {
        // const date = Date(Date.now());
        const formatdate = moment().format("YYYY-MM-DD");

        if (req.body.customfields) {
          for (const [keys, values] of Object.entries(metadata)) {
            const findquery = { "_id": values.custom_field_id };
            const finddata = await CustomField.find(findquery).lean();

            for (const [keysdata, valuesdata] of Object.entries(finddata)) {
              if (valuesdata.field_type == 'file') {
                for (const [key, value] of Object.entries(req.files)) {
                  if (value.fieldname == "rule_image") {
                    // Do something
                  } else {
                    const field = new mongoose.Types.ObjectId(values.custom_field_id).toString();
                    if (value.fieldname == field) {
                      const query1 = { "_id": values._id };
                      await CustomFieldMeta.deleteOne(query1);
                    }
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
              module: "rule",
              user_id: new mongoose.Types.ObjectId(req.session.user_id),
              reference_id: new mongoose.Types.ObjectId(id),
              updated_at: formatdate
            };
            await CustomFieldMeta.create(this_data);
          }
        }

        let m = 0;
        for (const [key, value] of Object.entries(req.files)) {
          if (value.fieldname == "rule_image") {
            // Do something
          } else {
            for (const [keys, values] of Object.entries(metadata)) {
              const query1 = { "_id": values._id };
              const field = new mongoose.Types.ObjectId(values.custom_field_id).toString();
              if (value.fieldname == field) {
                // Do something
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
                module: "rule",
                user_id: new mongoose.Types.ObjectId(req.session.user_id),
                reference_id: new mongoose.Types.ObjectId(id),
                updated_at: formatdate
              };
              await CustomFieldMeta.create(this_data);
            }
          }
        }
      } else {
        if (req.body.customfields) {
          for (const [key, value] of Object.entries(req.body.customfields)) {
            const this_data = {
              custom_field_id: new mongoose.Types.ObjectId(key),
              customfield_value: value,
              module: "rule",
              user_id: new mongoose.Types.ObjectId(req.session.user_id),
              reference_id: new mongoose.Types.ObjectId(id),
              updated_at: formatdate
            };
            await CustomFieldMeta.create(this_data);
          }
        }
        if (req.files) {
          for (const [key, value] of Object.entries(req.files)) {
            if (value.fieldname == "rule_image") {
              // Do something
            } else {
              const this_data = {
                custom_field_id: new mongoose.Types.ObjectId(value.fieldname),
                customfield_value: value.filename,
                module: "rule",
                user_id: new mongoose.Types.ObjectId(req.session.user_id),
                reference_id: new mongoose.Types.ObjectId(id),
                updated_at: formatdate
              };
              await CustomFieldMeta.create(this_data);
            }
          }
        }
      }

      req.flash('success', res.__('Rules Updated Successfully.'));
      res.redirect('/rule/rules');
    } else {

      const rule = new Rule({
        loantype: req.body.loantype,
        rule_title: req.body.rule_title,
        rule_desc: req.body.rule_desc,
        rule_image: uploadimg,
        loan_amount_rule: req.body.loan_amount_rule,
        addedby: new mongoose.Types.ObjectId(req.session.user_id),
      });
      const savedRule =
        await rule.save();
      console.log('INS:', savedRule);

      const date = Date(Date.now());
      const formatdate = moment().format("YYYY-MM-DD");

      const activityLog = new ActivityLog({
        date: formatdate,
        module: "Rule",
        action: "inserted",
        user: new mongoose.Types.ObjectId(req.session.user_id),
        item: req.body.loantype,
        status: 0,
      });

      await activityLog.save();

      if (req.body.customfields) {
        for (const [key, value] of Object.entries(req.body.customfields)) {
          const customFieldMeta = new CustomFieldMeta({
            custom_field_id: new mongoose.Types.ObjectId(key),
            customfield_value: value,
            module: "rule",
            user_id: new mongoose.Types.ObjectId(req.session.user_id),
            reference_id: savedRule._id,
            updated_at: formatdate,
          });

          await customFieldMeta.save();
        }
      }

      if (req.files) {
        for (const [key, value] of Object.entries(req.files)) {
          if (value.fieldname == "rule_image") {
            // Handle rule_image file
          } else {
            const customFieldMeta = new CustomFieldMeta({
              custom_field_id: new mongoose.Types.ObjectId(value.fieldname),
              customfield_value: value.filename,
              module: "rule",
              user_id: new mongoose.Types.ObjectId(req.session.user_id),
              reference_id: savedRule._id,
              updated_at: formatdate,
            });

            await customFieldMeta.save();
          }
        }
      }

      req.flash('success', res.__('Rule Inserted Successfully.'));
      res.redirect('/rule/rules');
    }
  } catch (err) {
    req.flash('error', res.__('Error occurred.'));
    res.redirect('/rule/rules');
  }
}
