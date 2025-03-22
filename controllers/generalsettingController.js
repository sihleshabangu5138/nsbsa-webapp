
'use strict';
const express = require('express');
const router = express.Router();
const fs = require('fs');
const lang = require('../config/languageconfig');
const GeneralSetting = require('../models/GeneralSetting');
const CustomField = require('../models/Customfields');
const { default: mongoose } = require('mongoose');
const flash = require('express-flash');
const { parse } = require('path');
router.use(flash());


/* GET generalsetting page. */
exports.getGeneralSettings = async (req, res) => {
  const languages = lang.getLocale();
  const id = req.params.id;

  try {
    if (id) {

      const result = await GeneralSetting.find({ "_id": new mongoose.Types.ObjectId(id) }).lean();
      const data = await fs.promises.readFile('public/data/countries.json');
      const jsonParsed = JSON.parse(data);
      req.session.company_logo = result[0].company_logo;
      req.session.generaldata = result[0]; 
      const customfield = await CustomField.find({}).lean();

      res.render('generalsettings/generalsetting', {
        title: "General Settings",
        data: result,
        id: id,
        session: req.session,
        country: jsonParsed.countries,
        messages: req.flash(),
        setlang: languages,
        newfield: customfield
      });
    } else {
      const news = [{ 'userid': '-1' }];
      const customfield = await CustomField.find({}).lean();

      res.render('generalsettings/generalsetting', {
        data: news,
        session: req.session,
        newfield: customfield
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}


exports.postGeneralSettings = async (req, res) => {
  const id1 = req.body.id;
       try {
         if (id1) {
             const updt_id = {
                 "_id":new mongoose.Types.ObjectId(id1)
             };
             const loc = req.body.localization;
             const finance = req.body.finance;
             const invoice = req.body.invoice;
             const pdf_settings = req.body.pdf_settings;
             const stripe = req.body.stripe;
 
             if (req.body.companybtn) {
                 let logo;
                 if (req.file != undefined) {
                      logo = req.file.filename;

                 } else {
                      logo = req.body.compan_old_images;
                 }
                 req.session.company_logo = logo;
                 const newvalues = {
                     $set: {
                         com_name: req.body.com_name,
                         com_email: req.body.com_email,
                         com_addr: req.body.com_addr,
                         company_logo: logo,
                         business_type: req.body.business_type,
                         country_code: req.body.country_code,
                         phone: req.body.phone,
                         footer_text: req.body.footer_text,
                         vat_no: req.body.vat_no,
                         gst_no: req.body.gst_no,
                         email_bcc: req.body.email_bcc,
                         zipcode: req.body.zipcode,
                         imgtype_jpg: req.body.imgtype_jpg === undefined ? null : req.body.imgtype_jpg,
                         imgtype_png: req.body.imgtype_png === undefined ? null : req.body.imgtype_png,
                         imgtype_jpeg: req.body.imgtype_jpeg === undefined ? null : req.body.imgtype_jpeg,
                         doctype: req.body.doctype,
                         imgupload_size: req.body.imgupload_size,
                         docupload_size: req.body.docupload_size,
                         country: parseInt(req.body.country, 10),
                         state: parseInt(req.body.state, 10),
                         city: parseInt(req.body.city, 10),
                         doctype_Pdf: req.body.doctype_Pdf === undefined ? null : req.body.doctype_Pdf,
                         doctype_Xlsx: req.body.doctype_Xlsx === undefined ? null : req.body.doctype_Xlsx,
                         doctype_Xls: req.body.doctype_Xls === undefined ? null : req.body.doctype_Xls,
                         doctype_Doc: req.body.doctype_Doc === undefined ? null : req.body.doctype_Pdf,
                         doctype_Docx: req.body.doctype_Docx === undefined ? null : req.body.doctype_Pdf,
                     }
                 };
                 try {
                   
                     await GeneralSetting.updateOne(updt_id, newvalues);
                     const data1 = await GeneralSetting.find(updt_id).lean();
                   
                     req.session.company_logo = logo;
                     req.session.generaldata = data1[0];  
                       
                     req.flash('success', res.__('Company Details Updated Successfully.'));
                     res.redirect('/generalsettings/generalsetting/' + id1);
                 } catch (err) {
                     req.flash('error', res.__('Error occurred in Settings.'));
                     res.redirect('/generalsettings/generalsetting/' + id1);
                 }
             }
 
             if (loc) {
                 const newvalues = {
                     $set: {
                         date_format: req.body.date_format,
                         time_format: req.body.time_format,
                         currency: req.body.currency,
                         language: req.body.language
                     }
                 };
                 try {
                     await GeneralSetting.updateOne(updt_id, newvalues);
                     const data1 = await GeneralSetting.find(updt_id).lean();
                     req.session.company_logo = data1[0].company_logo;
                     req.session.generaldata = data1[0];
                     res.cookie('locale', data1[0].language, {
                         maxAge: 90000000,
                         httpOnly: true
                     });
                     req.flash('success', res.__('Localization Updated Successfully.'));
                     res.redirect('/generalsettings/generalsetting/' + id1);
                 } catch (err) {
                     req.flash('error', res.__('Error occurred in Settings.'));
                     res.redirect('/generalsettings/generalsetting/' + id1);
                 }
             }
 
             if (finance) {
                 const name1 = req.body.tax_item;
                 const name2 = req.body.auto_round_off
               
                 const value1 = name1 === 'on' ? 1 : 0;
                 const value2 = name2 === 'on' ? 1 : 0;
                 const fin = {
                     $set: {
                         decimal_separator: req.body.decimal_separator,
                         thousand_separator: req.body.thousand_separator,
                         currency_set: req.body.currency_set,
                         tax_item: parseInt(value1),
                         Default_tax: req.body.Default_tax,
                         auto_round_off: parseInt(value2),
                     }
                 };
                 try {
                     await GeneralSetting.updateOne(updt_id, fin);
                     const data1 = await GeneralSetting.find(updt_id).lean();
                     req.session.company_logo = data1[0].company_logo;
                     req.session.generaldata = data1[0];
                     req.flash('success', res.__('Finance Updated Successfully.'));
                     res.redirect('/generalsettings/generalsetting/' + id1);
                 } catch (err) {
                     req.flash('error', res.__('Error occurred in Settings.'));
                     res.redirect('/generalsettings/generalsetting/' + id1);
                 }
             }
 
             if (invoice) {
                 const inv = {
                     $set: {
                         invoice_prefix: req.body.invoice_prefix,
                         invoice_number_format: req.body.invoice_number_format,
                         number_length: req.body.number_length,
                         bank_details: req.body.bank_details,
                         invoice_client_note: req.body.invoice_client_note,
                         invoice_predefined_terms: req.body.invoice_predefined_terms,
                     }
                 };
                 try {
                     await GeneralSetting.updateOne(updt_id, inv);
                     const data1 = await GeneralSetting.find(updt_id).lean();
                     req.session.company_logo = data1[0].company_logo;
                     req.session.generaldata = data1[0];
                     req.flash('success', res.__('Invoice Updated Successfully.'));
                     res.redirect('/generalsettings/generalsetting/' + id1);
                 } catch (err) {
                     req.flash('error', res.__('Error occurred in Settings.'));
                     res.redirect('/generalsettings/generalsetting/' + id1);
                 }
             }
 
             if (pdf_settings) {
                 if (req.file != undefined) {
                     var logo1 = req.file.filename;
                 } else {
                     var logo1 = req.body.sig_photo_old;
                 }
                 const name1 = req.body.show_transaction;
   const name2 = req.body.show_pdf_signature_invoice;
   const name3 = req.body.show_pdf_signature_creditnote
 
                 const value1 = name1 === 'on' ? 1 : 0;
   const value2 = name2 === 'on' ? 1 : 0;
   const value3 = name3 === 'on' ? 1 : 0;
                 console.log("1:",value1);
                 console.log("2:",value2);
                 const updatedFields = {
                     pdf_font: req.body.pdf_font,
                     tbl_head_color: req.body.tbl_head_color,
                     font_size: req.body.font_size,
                     tbl_head_txt_color: req.body.tbl_head_txt_color,
                     pdf_logo_url: req.body.pdf_logo_url,
                     pdf_logo_width: req.body.pdf_logo_width,
                     pdf_format: req.body.pdf_format,
                     signature_image: logo1,
                 };
             
                 // Update only if the values are different
                 if (parseInt(value1) !== pdf_settings.show_transaction) {
                     updatedFields.show_transaction = parseInt(value1);
                 }
             
                 if (parseInt(value2) !== pdf_settings.show_pdf_signature_invoice) {
                     updatedFields.show_pdf_signature_invoice = parseInt(value2);
                 }
             
                 if (parseInt(value3) !== pdf_settings.show_pdf_signature_creditnote) {
                     updatedFields.show_pdf_signature_creditnote = parseInt(value3);
                 }
             
                 const pdf = { $set: updatedFields };
                 try {
                     await GeneralSetting.updateOne(updt_id, pdf);
                     const data1 = await GeneralSetting.find(updt_id).lean();
                     req.session.company_logo = data1[0].company_logo;
                     req.session.generaldata = data1[0];
                     req.flash('success', res.__('PDF Settings Updated Successfully.'));
                     res.redirect('/generalsettings/generalsetting/' + id1);
                 } catch (err) {
                     req.flash('error', res.__('Error occurred in Settings.'));
                     res.redirect('/generalsettings/generalsetting/' + id1);
                 }
             }
             if (stripe) {
                 const newvalues = {
                     $set: {
                         stripe_secret_key: req.body.stripe_secret_key,
                         stripe_publishable_key: req.body.stripe_publishable_key,
                     
                     }
                 };
                 try {
                     await GeneralSetting.updateOne(updt_id, newvalues);
                     const data1 = await GeneralSetting.find(updt_id).lean();
                     req.session.company_logo = data1[0].company_logo;
                     req.session.generaldata = data1[0];
                     res.cookie('locale', data1[0].language, {
                         maxAge: 90000000,
                         httpOnly: true
                     });
                     req.flash('success', res.__('Stripe Updated Successfully.'));
                     res.redirect('/generalsettings/generalsetting/' + id1);
                 } catch (err) {
                     req.flash('error', res.__('Error occurred in Settings.'));
                     res.redirect('/generalsettings/generalsetting/' + id1);
                 }
             }
         }
       } catch (error) {
        console.log(error)
       }
  // try {
  //   const id = req.body.id;
  //   const updateData = {};

  //   if (req.body.companybtn) {
  //     updateData.com_name = req.body.com_name;
  //     updateData.com_email = req.body.com_email;
  //     updateData.com_addr = req.body.com_addr;
  //     updateData.business_type = req.body.business_type;
  //     updateData.country_code = req.body.country_code;
  //     updateData.phone = req.body.phone;
  //     updateData.footer_text = req.body.footer_text;
  //     updateData.vat_no = req.body.vat_no;
  //     updateData.gst_no = req.body.gst_no;
  //     updateData.email_bcc = req.body.email_bcc;
  //     updateData.zipcode = req.body.zipcode;
  //     updateData.imgtype_jpg = req.body.imgtype_jpg;
  //     updateData.imgtype_png = req.body.imgtype_png;
  //     updateData.imgtype_jpeg = req.body.imgtype_jpeg;
  //     updateData.doctype = req.body.doctype;
  //     updateData.imgupload_size = req.body.imgupload_size;
  //     updateData.docupload_size = req.body.docupload_size;
  //     updateData.country = parseInt(req.body.country, 10);
  //     updateData.state = parseInt(req.body.state, 10);
  //     updateData.city = parseInt(req.body.city, 10);
  //     updateData.doctype_Pdf = req.body.doctype_Pdf;
  //     updateData.doctype_Xlsx = req.body.doctype_Xlsx;
  //     updateData.doctype_Xls = req.body.doctype_Xls;
  //     updateData.doctype_Zip = req.body.doctype_Zip;
  //     updateData.doctype_Doc = req.body.doctype_Doc;
  //     updateData.doctype_Docx = req.body.doctype_Docx;

  //     if (req.file !== undefined) {
  //       updateData.company_logo = req.file.filename;
  //     } else {
  //       updateData.company_logo = req.body.compan_old_images;
  //     }
  //   }

  //   if (req.body.localization) {
  //     updateData.date_format = req.body.date_format;
  //     updateData.time_format = req.body.time_format;
  //     updateData.currency = req.body.currency;
  //     updateData.language = req.body.language;
  //   }

  //   if (req.body.finance) {
  //     updateData.decimal_separator = req.body.decimal_separator;
  //     updateData.thousand_separator = req.body.thousand_separator;
  //     updateData.currency_set = req.body.currency_set;
  //     updateData.tax_item = req.body.tax_item;
  //     updateData.Default_tax = req.body.Default_tax;
  //     updateData.auto_round_off = req.body.auto_round_off;
  //   }

  //   if (req.body.invoice) {
  //     updateData.invoice_prefix = req.body.invoice_prefix;
  //     updateData.invoice_number_format = req.body.invoice_number_format;
  //     updateData.number_length = req.body.number_length;
  //     updateData.bank_details = req.body.bank_details;
  //     updateData.invoice_client_note = req.body.invoice_client_note;
  //     updateData.invoice_predefined_terms = req.body.invoice_predefined_terms;
  //   }

  //   if (req.body.pdf_settings) {
  //     updateData.pdf_font = req.body.pdf_font;
  //     updateData.tbl_head_color = req.body.tbl_head_color;
  //     updateData.font_size = req.body.font_size;
  //     updateData.tbl_head_txt_color = req.body.tbl_head_txt_color;
  //     updateData.pdf_logo_url = req.body.pdf_logo_url;
  //     updateData.pdf_logo_width = req.body.pdf_logo_width;
  //     updateData.show_transaction = req.body.show_transaction;
  //     updateData.show_pdf_signature_invoice = req.body.show_pdf_signature_invoice;
  //     updateData.show_pdf_signature_creditnote = req.body.show_pdf_signature_creditnote;
  //     updateData.pdf_format = req.body.pdf_format;

  //     if (req.file !== undefined) {
  //       updateData.signature_image = req.file.filename;
  //     } else {
  //       updateData.signature_image = req.body.sig_photo_old;
  //     }
  //   }

  //   const updatedGeneralSetting = await GeneralSetting.findByIdAndUpdate({ "_id": new mongoose.Types.ObjectId(id) }, updateData, { new: true });

  //   if (!updatedGeneralSetting) {
  //     req.flash('error', res.__('Error occurred in Settings.'));
  //     return res.redirect(`/generalsettings/generalsetting/${id}`);
  //   }

  //   req.session.company_logo = updatedGeneralSetting.company_logo;
  //   req.session.generaldata = updatedGeneralSetting;

  //   if (req.body.localization) {
  //     res.cookie('locale', updatedGeneralSetting.language, { maxAge: 90000000, httpOnly: true });
  //   }

  //   if (req.body.companybtn) {
  //     req.flash('success', res.__('Company Details Updated Successfully.'));
  //   } else if (req.body.localization) {
  //     req.flash('success', res.__('Localization Updated Successfully.'));
  //   } else if (req.body.finance) {
  //     req.flash('success', res.__('Finance Updated Successfully.'));
  //   } else if (req.body.invoice) {
  //     req.flash('success', res.__('Invoice Updated Successfully.'));
  //   } else if (req.body.pdf_settings) {
  //     req.flash('success', res.__('PDF Settings Updated Successfully.'));
  //   }

  //   res.redirect(`/generalsettings/generalsetting/${id}`);
  // } catch (error) {
  //   req.flash('error', res.__('Error occurred in Settings.'));
  //   res.redirect(`/generalsettings/generalsetting/${id}`);
  // }
};
