const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const AccessRights = require('../models/AccessRights');
const mongoose = require('mongoose');
const CustomFieldMeta = require('../models/CustomFieldMeta');
const CustomField = require('../models/Customfields');
const ActivityLog = require('../models/Activitylog');
const moment = require('moment');

exports.getRoleData = async (req, res, next) => {
  try {
    const access = await AccessRights.find({ rolename: req.session.role_slug }).lean();
    let access_data = [];

    for (const [key, value] of Object.entries(access)) {

      for (const [key1, value1] of Object.entries(value['access_type'])) {
        if (key1 == "role") {
          access_data = value1;
        }
      }
    };

    res.render('role/roles', { title: 'Roles', session: req.session, messages: req.flash(), accessrightdata: access_data });
  } catch (err) {
    next(err);
  }
};

// DELETE role by ID
exports.getDeleteRole = async (req, res, next) => {
  const id = req.params.id;

  try {
    const result = await Role.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    if (result.deletedCount > 0) {
      res.redirect('/role/rolelist');
    } else {
      throw new Error('Role not found');
    }
  } catch (err) {
    next(err);
  }
};

///////////////////////////////////////////  Add  Role  ////////////////////////////////////////////////// 
exports.getAddRole = async (req, res) => {
  try {
    const id = req.params.id;

    if (id) {
      // console.log("id", id);
      const result = await Role.find({ "_id": new mongoose.Types.ObjectId(id) }).lean();
      const mydata = { $and: [{ "module_name": "role" }, { "field_visibility": 1 }] };
      const customfield = await CustomField.find(mydata).lean();
      for (const [key, value] of Object.entries(customfield)) {
        customfield.forEach(element => {
          customfield[key].id_d = new mongoose.Types.ObjectId(value._id).toString();
        });
      };
      console.log(customfield);
      console.log(result[0]._id);

      const myquery1 = { "reference_id": new mongoose.Types.ObjectId(id) };
      const customfield_value = await CustomFieldMeta.find(myquery1).lean();

      // for (const customfield_value of customfield_values) {
      //   customfield_value.id_d =new mongoose.Types.ObjectId(customfield_value.custom_field_id).toString();
      // }
      for (const [key, value] of Object.entries(customfield_value)) {
        customfield_value[key].id_d = new mongoose.Types.ObjectId(value.custom_field_id).toString();
      };

      console.log(customfield_value);
      res.render('role/addrole', { title: "Edit Role", data: result, id: id, session: req.session, newfield: customfield, customfield_value: customfield_value });
      // console.log(result,id);
    } else {
      const news = [{ userid: '-1' }];
      const customfield = await CustomField.find({ module_name: 'role', field_visibility: 1 }).lean();

      res.render('role/addrole', {
        title: 'Add Role',
        data: news,
        session: req.session,
        newfield: customfield,
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



exports.postAddRole = async (req, res) => {
  const id = req.body.id;
  // console.log(id)
  const name1 = req.body.admin_access;
  const name2 = req.body.allow_access;

  const value1 = name1 === 'on' ? 1 : 0;
  const value2 = name2 === 'on' ? 1 : 0;
  // console.log(req.body); // Log other form fields
  // console.log(req.file); // Log information about the uploaded file


  if (id) {
    // console.log("id", id);
    // console.log("_id", new mongoose.Types.ObjectId(id));
    const updatedRole = {
      role_nm: req.body.role_nm,
      role_slug: req.body.role_slug,
      role_desc: req.body.role_desc,
      admin_access: parseInt(value1),
      allow_access: parseInt(value2),
      status: 0,
    };

    await Role.findByIdAndUpdate({ "_id": new mongoose.Types.ObjectId(id) }, updatedRole);

    const date = new Date();
    const formattedDate = moment(date).format("YYYY-MM-DD");

    const activityLog = new ActivityLog({
      date: formattedDate,
      module: "Role",
      action: "updated role",
      user: new mongoose.Types.ObjectId(req.session.user_id),
      item: req.body.role_nm,
      status: 0,
    });
    await activityLog.save();

    const metadata = await CustomFieldMeta.find({ "reference_id": new mongoose.Types.ObjectId(id) });

    if (metadata.length > 0) {
      // const date = Date(Date.now());
      const formatdate = moment().format("YYYY-MM-DD");
      // console.log(req.body.customfields);
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
            module: "role",
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
            module: "role",
            user_id: new mongoose.Types.ObjectId(req.session.user_id),
            reference_id: new mongoose.Types.ObjectId(id),
            updated_at: formatdate,
          };
          await CustomFieldMeta.create(this_data);
        }
      }
    } else {
      console.log("no data");
      if (req.body.customfields) {
        for (const [key, value] of Object.entries(req.body.customfields)) {
          const this_data = {
            custom_field_id: new mongoose.Types.ObjectId(key),
            customfield_value: value,
            module: "role",
            user_id: new mongoose.Types.ObjectId(req.session.user_id),
            reference_id: new mongoose.Types.ObjectId(id),
            updated_at: formattedDate,
          };
          await CustomFieldMeta.create(this_data);
        }
      }
      if (req.files) {
        for (const [key, value] of Object.entries(req.files)) {
          const this_data = {
            custom_field_id: new mongoose.Types.ObjectId(value.fieldname),
            customfield_value: value.filename,
            module: "role",
            user_id: new mongoose.Types.ObjectId(req.session.user_id),
            reference_id: new mongoose.Types.ObjectId(id),
            updated_at: formattedDate,
          };
          await CustomFieldMeta.create(this_data);
        }
      }
    }


    req.flash('success', res.__('Role Updated Successfully.'));
    res.redirect('/role/roles');
  } else {
    const { role_nm, role_slug, role_desc, customfields } = req.body;

    const role = new Role({
      role_nm,
      role_slug,
      role_desc,
      admin_access: parseInt(value1),
      allow_access: parseInt(value2),
      status: 0
    });

    const savedRole = await role.save();

    const existingAccess = await AccessRights.findOne({ rolename: role_slug });

    if (!existingAccess) {
      const access = new AccessRights({
        rolename: role_slug,
        access_type: null
      })
      await access.save();
    }

    const date = new Date();
    const formatdate = date.toISOString().split('T')[0];

    const activityLog = new ActivityLog({
      date: formatdate,
      module: 'Role',
      action: 'inserted role',
      user: new mongoose.Types.ObjectId(req.session.user_id),
      item: role_nm,
      status: 0
    });

    await activityLog.save();

    if (customfields) {
      for (const [key, value] of Object.entries(customfields)) {
        const customFieldMeta = new CustomFieldMeta({
          custom_field_id: new mongoose.Types.ObjectId(key),
          customfield_value: Array.isArray(value) ? value : [value],
          module: 'role',
          user_id: new mongoose.Types.ObjectId(req.session.user_id),
          reference_id: savedRole._id,
          updated_at: formatdate
        });

        await customFieldMeta.save();
      }
    }

    if (req.files) {
      for (const [key, value] of Object.entries(req.files)) {
        const customFieldMeta = new CustomFieldMeta({
          custom_field_id: new mongoose.Types.ObjectId(value.fieldname),
          customfield_value: value.filename,
          module: 'role',
          user_id: new mongoose.Types.ObjectId(req.session.user_id),
          reference_id: savedRole._id,
          updated_at: formatdate
        });

        await customFieldMeta.save();
      }
    }
    console.log("user_id", new mongoose.Types.ObjectId(req.session.user_id))
    console.log("reference_id", savedRole._id);

    req.flash('success', res.__('Role Inserted Successfully.'));
    res.redirect('/role/roles');
  }
};