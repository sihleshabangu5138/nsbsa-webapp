'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const AccessRights = require('../models/AccessRights'); // Assuming you have a Mongoose model defined for 'Access_Rights'
const Note = require('../models/Notes');
const Product = require('../models/Product');
const Category = require('../models/Category');
const CustomField = require('../models/Customfields');
const CustomFieldMeta = require('../models/CustomFieldMeta');
const ActivityLog = require('../models/Activitylog');
const moment = require('moment');

exports.getProductList = async (req, res, next) => {
  try {
    const myquery = { "rolename": req.session.role_slug };
    let access_data = [];

    const access = await AccessRights.find(myquery).lean();

    for (const [key, value] of Object.entries(access)) {
      for (const [key1, value1] of Object.entries(value['access_type'])) {
        if (key1 == "product") {
          access_data = value1;
        }
      }
    };

    res.render('product/productlist', { title: 'Products', session: req.session, messages: req.flash(), accessrightdata: access_data });
  } catch (err) {
    // Handle errors appropriately, e.g., log the error and render an error page.
    console.error(err);
    next(err);
  }
};

exports.getAddProduct = async (req, res) => {
  const id = req.params.id;

  try {
    if (id) {
      const category = await Category.find({ categorytypes: 'product' }).lean();
      const unitcategory = await Category.find({ categorytypes: 'product_unit' }).lean();
      const notes = await Note.find({ "module_id": new mongoose.Types.ObjectId(id) }).lean();
      const product = await Product.find({ "_id": new mongoose.Types.ObjectId(id) }).lean();
      const customfield = await CustomField.find({ "module_name": 'product', "field_visibility": "1" }).lean();
      const customfield_value = await CustomFieldMeta.find({ reference_id: new mongoose.Types.ObjectId(id) }).lean();

      for (const field of customfield) {
        field.id_d = new mongoose.Types.ObjectId(field._id).toString();
      }

      for (const field of customfield_value) {
        field.id_d = new mongoose.Types.ObjectId(field.custom_field_id).toString();
      }

      res.render('product/addproduct', {
        title: 'Edit Product',
        session: req.session,
        messages: req.flash(),
        category: category,
        unit: unitcategory,
        data: product,
        newfield: customfield,
        customfield_value: customfield_value,
        note: notes
      });
    } else {
      const news = [{ 'userid': '-1' }];
      const query = { "categorytypes": "product" };
      const unit_query = { "categorytypes": "product_unit" };
      const mydata = { $and: [{ "module_name": "product" }, { "field_visibility": 1 }] };

      const customfield = await CustomField.find(mydata).lean();

      // customfield.forEach((element, key) => {
      //   customfield[key].id_d =new mongoose.Types.ObjectId(element._id).toString();
      // });
      for (const [key, value] of Object.entries(customfield)) {
        customfield.forEach(element => {
          customfield[key].id_d = new mongoose.Types.ObjectId(value._id).toString();
        });
      }


      const myquery1 = { "reference_id": new mongoose.Types.ObjectId(id) };
      const customfield_value = await CustomFieldMeta.find(myquery1).lean();

      // customfield_value.forEach((element, key) => {
      //   customfield_value[key].id_d = ObjectId(element.custom_field_id).toString();
      // });
      for (const [key, value] of Object.entries(customfield_value)) {
        customfield_value[key].id_d = new mongoose.Types.ObjectId(value.custom_field_id).toString();
      }


      const category = await Category.find(query).lean();
      const unitcategory = await Category.find(unit_query).lean();
      console.log(customfield);
      res.render('product/addproduct', { title: "Add Product", data: news, session: req.session, category, unit: unitcategory, newfield: customfield, customfield_value: customfield_value, note: news });
     
    }
  } catch (err) {
    console.error(err);
    // Handle errors here
    res.status(500).send('Internal Server Error');
  }
};

exports.postAddProduct = async (req, res) => {
  // console.log(req.body); // Log other form fields
  // console.log(req.file); // Log information about the uploaded file

  const id = req.body.id;
  let productimg = [];
  let attachfiles = [];
  // Process product images
  const upimg = req.body.productimage_old;
  if (upimg !== undefined) {
    if (Array.isArray(upimg)) {
      productimg = req.body.productimage_old;
    } else {
      productimg.push(upimg);
    }
  }

  for (const [keys, values] of Object.entries(req.files)) {
    if (values.fieldname === "productimage") {
      const img = values.filename;
      productimg.push(img);
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
  for (const [key, values] of Object.entries(req.files)) {
    if (values.fieldname === "attachfile") {
      const attach = values.filename;
      attachfiles.push(attach);
    }
  }

  // Process tags
  const tags = req.body.tagname;
  const tag = Array.isArray(tags) ? tags : [tags];
  console.log("tag :",tag);
  const tagValue = tag.length > 0 && tag[0] !== undefined ? tag : 'N/A';
  console.log("tagValue",tagValue);

  // Process notes and attach files
  const note = req.body.note;
  let addnote = [];

  if (Array.isArray(note)) {
    addnote = req.body.note;
  } else {
    addnote.push(note);
  }
  const stockExpiry = req.body.stockexpiry || null;

  if (id) {
    try {
      const savedProduct = await Product.findByIdAndUpdate(
        { "_id": new mongoose.Types.ObjectId(id) },
        {
          productname: req.body.productname,
          categorytypes: req.body.categorytypes,
          productunit: req.body.productunit,
          description: req.body.description,
          productimage: productimg,
          warranty: req.body.warranty,
          dur_type: req.body.dur_type,
          tagname: tagValue,
          skubarcode: req.body.skubarcode,
          initialstock: req.body.initialstock,
          stockexpiry: stockExpiry,
          locationrack: req.body.locationrack,
          retailprice: req.body.retailprice,
          specialprice: req.body.specialprice,
          supplyprice: req.body.supplyprice,
          commission: req.body.commission,
          addedby: new mongoose.Types.ObjectId(req.session.user_id),
        },
      );
      // Logging activity
      const date = moment().format("YYYY-MM-DD");
      const activityLog = {
        date: date,
        module: "Product",
        action: "updated product",
        user: new mongoose.Types.ObjectId(req.session.user_id),
        item: req.body.productname,
        status: 0,
      };
      await ActivityLog.create(activityLog);

      // Update notes
      const notequery = { "module_id": new mongoose.Types.ObjectId(id) };
      const notedata = await Note.find(notequery).lean();
      if (notedata.length > 0) {
        for (const value of notedata) {
          const nquery = { "_id": new mongoose.Types.ObjectId(value._id) };
          if (req.body.note || req.files) {
            const this_data = {
              $set: {
                note: addnote, // Assuming addnote is supposed to be req.body.note
                fileattach: attachfiles, // Assuming attachfiles is supposed to be file
              },
            };
            await Note.findByIdAndUpdate(nquery, this_data);
          }
        }
      }
      else {
        if (req.files && note) {
          const notes = new Note({
            note: addnote,
            fileattach: attachfiles,
            module: "product",
            module_id: savedProduct._id
          });

          await notes.save();
        }
      }
      // Update custom field meta
      const metadataQuery = { "reference_id": new mongoose.Types.ObjectId(id) };
      const metadata = await CustomFieldMeta.find(metadataQuery).lean();
      console.log("Metadata : ", metadata)
      if (metadata.length > 0) {
        // const date = Date.now();
        const formatdate = moment().format("YYYY-MM-DD");

        if (req.body.customfields) {
          for (const [keys, values] of Object.entries(metadata)) {
            const findquery = { "_id": values.custom_field_id };
            const finddata = await CustomField.find(findquery).lean();
            console.log("finddata", finddata)
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
              module: "product",
              user_id: new mongoose.Types.ObjectId(req.session.user_id),
              reference_id: new mongoose.Types.ObjectId(id),
              updated_at: formatdate,
            };
            await CustomFieldMeta.create(this_data);
          }
        }

        let m = 0;
        for (const [key, value] of Object.entries(req.files)) {
          if (value.fieldname == "productimage" || value.fieldname == "attachfile") {
            // Do something
          } else {
            for (const [keys, values] of Object.entries(metadata)) {
              const query1 = { _id: values._id };
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
                module: "product",
                user_id: new mongoose.Types.ObjectId(req.session.user_id),
                reference_id: new mongoose.Types.ObjectId(id),
                updated_at: formatdate,
              };
              await CustomFieldMeta.create(this_data);
            }
          }
        }
      } else {
        // const date = Date.now();
        const formatdate = moment().format("YYYY-MM-DD");

        if (req.body.customfields) {
          for (const [key, value] of Object.entries(req.body.customfields)) {
            const this_data = {
              custom_field_id: new mongoose.Types.ObjectId(key),
              customfield_value: value,
              module: "product",
              user_id: new mongoose.Types.ObjectId(req.session.user_id),
              reference_id: new mongoose.Types.ObjectId(id),
              updated_at: formatdate,
            };
            await CustomFieldMeta.create(this_data);
          }
        }

        if (req.files) {
          for (const [key, value] of Object.entries(req.files)) {
            if (value.fieldname == "productimage" || value.fieldname == "attachfile") {
              // Do something
            } else {
              const this_data = {
                custom_field_id: new mongoose.Types.ObjectId(value.fieldname),
                customfield_value: value.filename,
                module: "product",
                user_id: new mongoose.Types.ObjectId(req.session.user_id),
                reference_id: new mongoose.Types.ObjectId(id),
                updated_at: formatdate,
              };
              await CustomFieldMeta.create(this_data);
            }
          }
        }
      }


      req.flash('success', res.__('Product Updated Successfully.'));
      res.redirect('/product/productlist');
    } catch (error) {
      req.flash('error', res.__('Error occurred.'));
      res.redirect('/product/productlist');
    }
  }
  else {
    try {
      const productData = {
        productname: req.body.productname,
        categorytypes: req.body.categorytypes,
        productunit: req.body.productunit,
        description: req.body.description,
        productimage: productimg,
        warranty: req.body.warranty,
        dur_type: req.body.dur_type,
        tagname: tagValue,
        skubarcode: req.body.skubarcode,
        initialstock: req.body.initialstock,
        stockexpiry: stockExpiry,
        locationrack: req.body.locationrack,
        retailprice: req.body.retailprice,
        specialprice: req.body.specialprice,
        supplyprice: req.body.supplyprice,
        commission: req.body.commission,
        addedby: new mongoose.Types.ObjectId(req.session.user_id),
      };
      console.log(productData);

      const product = new Product(productData);

      const savedProduct = await product.save();


      // const date = Date(Date.now());
      const formatdate = moment().format("YYYY-MM-DD");
      const activity = new ActivityLog({
        date: formatdate,
        module: " Product",
        action: "inserted product",
        user: new mongoose.Types.ObjectId(req.session.user_id),
        item: req.body.productname,
        status: 0
      });
      await activity.save();

      // if (req.files) {
      //   for (const [key, value] of Object.entries(req.files)) {
      //     if (req.body.note || value.fieldname === "attachfile") {
      //       const this_data1 ={
      //         note: addnote,
      //         fileattach: attachfiles,
      //         module: "product",
      //         module_id:new mongoose.Types.ObjectId(savedProduct._id)
      //       };
      //       await Note.create(this_data1);
      //     }
      //   }
      // }

      if (req.files && note) {
        const notes = new Note({
          note: addnote,
          fileattach: attachfiles,
          module: "product",
          module_id: savedProduct._id
        });

        await notes.save();
      }

      if (req.body.customfields) {
        for (const [key, value] of Object.entries(req.body.customfields)) {
          const this_data2 = {
            custom_field_id: new mongoose.Types.ObjectId(key),
            customfield_value: value,
            module: "product",
            user_id: new mongoose.Types.ObjectId(req.session.user_id),
            reference_id: savedProduct._id,
            updated_at: formatdate
          };
          await CustomFieldMeta.create(this_data2);
        }
      }

      if (req.files) {
        for (const [key, value] of Object.entries(req.files)) {
          if (value.fieldname !== "productimage" && value.fieldname !== "attachfile") {
            const this_data = {
              custom_field_id: new mongoose.Types.ObjectId(value.fieldname),
              customfield_value: value.filename,
              module: "product",
              user_id: new mongoose.Types.ObjectId(req.session.user_id),
              reference_id: savedProduct._id,
              updated_at: formatdate
            };
            await CustomFieldMeta.create(this_data);
          }
        }
      }


      req.flash('success', res.__('Product Inserted Successfully.'));
      res.redirect('/product/productlist');
    } catch (error) {
      req.flash('error', res.__('Error occurred.'));
      res.redirect('/product/productlist');
    }
  }
};


exports.getViewProduct = async (req, res) => {
  try {
    const id = req.params.id;

    if (id) {
      const product = await Product.find({ "_id": new mongoose.Types.ObjectId(id) }).lean();

      if (!product) {
        return res.status(404).render('error', { title: 'Product Not Found', message: 'Product not found' });
      }

      res.render('product/viewproduct', { title: 'View Product', data: product, id: id, session: req.session });
    } else {
      const products = [{ 'userid': '-1' }];
      res.render('product/viewproduct', { title: 'View Product', data: products, family: products, session: req.session });
    }
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { title: 'Server Error', message: 'Internal server error' });
  }
};
