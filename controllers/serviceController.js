'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const AccessRights = require('../models/AccessRights');
const Service = require('../models/Service');
const Notes = require('../models/Notes');
const Category = require('../models/Category');
const User = require('../models/User');
const CustomFieldMeta = require('../models/CustomFieldMeta');
const CustomField = require('../models/Customfields');
const ActivityLog = require('../models/Activitylog');
const Generalsetting = require('../models/GeneralSetting');
const moment = require('moment');


/* GET users listing. */
exports.getServiceList = async (req, res, next) => {
  let access_data = [];

  try {
    const access = await AccessRights.find({ rolename: req.session.role_slug }).lean();

    for (const [key, value] of Object.entries(access)) {
      for (const [key1, value1] of Object.entries(value['access_type'])) {
        if (key1 == "service") {
          access_data = value1;
        }
      }
    };
    res.render('service/servicelist', {
      title: 'Services',
      session: req.session,
      messages: req.flash(),
      accessrightdata: access_data,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAddService = async (req, res) => {
  try {
    const id = req.params.id;
    if (id) {
      const service = await Service.find({ "_id": new mongoose.Types.ObjectId(id) }).lean();
      const category = await Category.find({ categorytypes: "service" }).lean();
      const notes = await Notes.find({ "module_id": new mongoose.Types.ObjectId(id) }).lean();
      const staff = await User.find({ role: new mongoose.Types.ObjectId("5d5ce97225a26b1fb45236ba") }).lean();
      console.log("Notes", notes)
      staff.forEach((element, key) => {
        staff[key].id_d = new mongoose.Types.ObjectId(element._id).toString();
      });
      const settings = await Generalsetting.find({}).lean();

      const customfield = await CustomField.find({ $and: [{ module_name: "service" }, { field_visibility: 1 }] }).lean();

      customfield.forEach((element, key) => {
        customfield[key].id_d = element._id.toString();
      });

      const customfield_value = await CustomFieldMeta.find({ "reference_id": new mongoose.Types.ObjectId(id) }).lean();

      customfield_value.forEach((element, key) => {
        customfield_value[key].id_d = new mongoose.Types.ObjectId(element.custom_field_id).toString();
      });

      res.render('service/addservice', { title: 'Edit Service', session: req.session, messages: req.flash(), category, staff,setting: settings, data: service, newfield: customfield, customfield_value, note: notes });
    } else {
      const query = { categorytypes: "service" };
      const staffquery = { role: new mongoose.Types.ObjectId("5d5ce97225a26b1fb45236ba") };
      const news = [{ 'userid': '-1' }];

      const [result, staff, customfield] = await Promise.all([
        Category.find(query).lean(),
        User.find(staffquery).lean(),
        CustomField.find({ $and: [{ module_name: "service" }, { field_visibility: 1 }] }).lean(),
      ]);
      const settings = await Generalsetting.find({}).lean();

      staff.forEach((element, key) => {
        staff[key].id_d = new mongoose.Types.ObjectId(element._id).toString();
      });

      const customfield_value = await CustomFieldMeta.find({ reference_id: new mongoose.Types.ObjectId(id) }).lean();

      customfield_value.forEach((element, key) => {
        customfield_value[key].id_d = new mongoose.Types.ObjectId(element.custom_field_id).toString();
      });

      res.render('service/addservice', {
        title: "Add Service",
        data: news,
        session: req.session,
        category: result,
        staff,
        newfield: customfield,
        customfield_value,
        note: news,
        setting: settings,
      });
    }
  } catch (err) {
    // Handle errors appropriately (e.g., log the error and render an error page)
    console.error(err);
    res.status(500).send('Internal Server Error');
  }

}
exports.postAddService = async (req, res) => {
  const id = req.body.id;
  let uploadimg = [];
  let attachfiles = [];
  const upimg = req.body.image_old;

  if (upimg !== undefined) {
    if (Array.isArray(upimg)) {
      uploadimg = req.body.image_old;
    } else {
      uploadimg.push(upimg);
    }
  }

  for (const [keys, values] of Object.entries(req.files)) {
    if (values.fieldname === "uploadimages") {
      const img = values.filename;
      uploadimg.push(img);
    }
  }

  const atimg = req.body.attachfile_old;

  if (atimg !== undefined) {
    if (Array.isArray(atimg)) {
      attachfiles = req.body.attachfile_old;
    } else {
      attachfiles.push(atimg);
    }
  }

  for (const [keys, values] of Object.entries(req.files)) {
    if (values.fieldname === "attachfile") {
      const attach = values.filename;
      attachfiles.push(attach);
    }
  }

  const staff = req.body.assigned_staff;
  let staffs = [];

  if (Array.isArray(staff)) {
    staffs = req.body.assigned_staff;
  } else {
    staffs.push(staff);
  }

  // const tags = req.body.tagname;
  // let tag = [];

  // if (Array.isArray(tags)) {
  //   tag = req.body.tagname;
  // } else {
  //   tag.push(tags);
  // }
  const tags = req.body.tagname;
  const tag = Array.isArray(tags) ? tags : [tags];

  const note = req.body.note;
  let addnote = [];

  if (Array.isArray(note)) {
    addnote = req.body.note;
  } else {
    addnote.push(note);
  }

  try {
    if (id) {
      const savedService = await Service.findByIdAndUpdate(
        { "_id": new mongoose.Types.ObjectId(id) },
        {
          servicename: req.body.servicename,
          categorytypes: req.body.categorytypes,
          servicefor: req.body.servicefor,
          description: req.body.description,
          uploadimages: uploadimg,
          tagname: tag.length > 0 ? tag : undefined,
          duration_hour: req.body.duration_hour,
          duration_minute: req.body.duration_minute,
          pricetype: req.body.pricetype,
          price: req.body.price,
          assigned_staff: staffs,
          user_capacity: req.body.user_capacity,
          enable_online_booking: req.body.enable_online_booking,
          addedby: new mongoose.Types.ObjectId(req.session.user_id),
        },
      );

      const date = new Date();
      const formatdate = moment(date).format("YYYY-MM-DD");
      const activityLog = new ActivityLog({
        date: formatdate,
        module: "Service",
        action: "updated service",
        user: new mongoose.Types.ObjectId(req.session.user_id),
        item: req.body.servicename,
        status: 0,
      });
      await activityLog.save();

      const notequery = { "module_id": new mongoose.Types.ObjectId(id) };
      const notedata = await Notes.find(notequery).lean();
      if (notedata.length > 0) {
        for (const value of notedata) {
          const nquery = { "_id": new mongoose.Types.ObjectId(value._id) };

          if (req.body.note || req.files) { // Adjusted the condition here
            const this_data = {
              $set: {
                note: addnote,
                fileattach: attachfiles,
              },
            };

            await Notes.updateOne(nquery, this_data);
          }
        }
      }
      else {
        if (req.files && note) {
          const notes = new Notes({
            note: addnote,
            fileattach: attachfiles,
            module: "service",
            module_id: savedService._id
          });

          await notes.save();
        }
      }

      const metadata = await CustomFieldMeta.find({ "reference_id": new mongoose.Types.ObjectId(id) });
      console.log("Metadata : ", metadata);

      if (metadata.length > 0) {
        if (req.body.customfields) {
          for (const [keys, values] of Object.entries(metadata)) {
            const findquery = { "_id": values.custom_field_id };
            const finddata = await CustomField.find(findquery).lean();

            for (const [keysdata, valuesdata] of Object.entries(finddata)) {
              if (valuesdata.field_type === 'file') {
                for (const [key, value] of Object.entries(req.files)) {
                  const field = new mongoose.Types.ObjectId(values.custom_field_id).toString();
                  if (value.fieldname === field) {
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
              module: 'service',
              user_id: new mongoose.Types.ObjectId(req.session.user_id),
              reference_id: new mongoose.Types.ObjectId(id),
              updated_at: formatdate,
            };
            await CustomFieldMeta.create(this_data);
          }
        }

        let m = 0;
        for (const [key, value] of Object.entries(req.files)) {
          if (value.fieldname === 'uploadimages' || value.fieldname === 'attachfile') {
            // Handle file uploads
          } else {
            for (const [keys, values] of Object.entries(metadata)) {
              const query1 = { _id: values._id };
              const field = new mongoose.Types.ObjectId(values.custom_field_id).toString();
              if (value.fieldname === field) {
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
                module: 'service',
                user_id: new mongoose.Types.ObjectId(req.session.user_id),
                reference_id: new mongoose.Types.ObjectId(id),
                updated_at: formatdate,
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
              module: 'service',
              user_id: new mongoose.Types.ObjectId(req.session.user_id),
              reference_id: new mongoose.Types.ObjectId(id),
              updated_at: formatdate,
            };
            await CustomFieldMeta.create(this_data);
          }
        }

        if (req.files) {
          for (const [key, value] of Object.entries(req.files)) {
            if (value.fieldname === 'uploadimages' || value.fieldname === 'attachfile') {
              // Handle file uploads
            } else {
              const this_data = {
                custom_field_id: new mongoose.Types.ObjectId(value.fieldname),
                customfield_value: value.filename,
                module: 'service',
                user_id: new mongoose.Types.ObjectId(req.session.user_id),
                reference_id: new mongoose.Types.ObjectId(id),
                updated_at: formatdate,
              };
              await CustomFieldMeta.create(this_data);
            }
          }
        }
      }

      req.flash('success', res.__('Service Updated Successfully.'));
      res.redirect('/service/servicelist');
    } else {

      const serviceData = {
        servicename: req.body.servicename,
        categorytypes: req.body.categorytypes,
        servicefor: req.body.servicefor,
        description: req.body.description,
        uploadimages: uploadimg,
        tagname: tag.length > 0 ? tag : null,
        duration_hour: req.body.duration_hour,
        duration_minute: req.body.duration_minute,
        pricetype: req.body.pricetype,
        price: req.body.price,
        assigned_staff: staffs,
        user_capacity: req.body.user_capacity,
        enable_online_booking: req.body.enable_online_booking,
        addedby: new mongoose.Types.ObjectId(req.session.user_id),
      };
      if (tag.length > 0) {
        serviceData.tagname = tag;
      }

      const service = new Service(serviceData);

      const savedService = await service.save();

      const date = moment().format("YYYY-MM-DD");

      const activityLog = {
        date,
        module: "Service",
        action: "inserted service",
        user: new mongoose.Types.ObjectId(req.session.user_id),
        item: req.body.servicename,
        status: 0
      };

      await ActivityLog.create(activityLog);

      if (req.body.customfields) {
        for (const [key, value] of Object.entries(req.body.customfields)) {
          const customFieldMeta = new CustomFieldMeta({
            custom_field_id: new mongoose.Types.ObjectId(key),
            customfield_value: value,
            module: "service",
            user_id: new mongoose.Types.ObjectId(req.session.user_id),
            reference_id: savedService._id,
            updated_at: date
          });

          await customFieldMeta.save();
        }
      }

      if (req.files) {
        for (const [key, value] of Object.entries(req.files)) {
          if (value.fieldname !== "uploadimages" && value.fieldname !== "attachfile") {
            const customFieldMeta = new CustomFieldMeta({
              custom_field_id: new mongoose.Types.ObjectId(value.fieldname),
              customfield_value: value.filename,
              module: "service",
              user_id: new mongoose.Types.ObjectId(req.session.user_id),
              reference_id: savedService._id,
              updated_at: date
            });

            await customFieldMeta.save();
          }
        }
      }

      if (req.files && note) {
        const notes = new Notes({
          note: addnote,
          fileattach: attachfiles,
          module: "service",
          module_id: savedService._id
        });

        await notes.save();
      }

      req.flash('success', res.__('Service Added Successfully.'));
      res.redirect('/service/servicelist');
    }
  } catch (error) {
    console.error(error);
    req.flash('error', res.__('Error occurred.'));
    res.redirect('/service/servicelist');
  }
};







