'use strict';
var express = require('express');
const MongoClient = require('mongodb').MongoClient;
var router = express.Router();
var lang = require('./languageconfig');
var fs = require('fs');
var ObjectId = require('mongodb').ObjectId;
var bcrypt = require('bcrypt');
var session = require('express-session');
const replace = require('replace-in-file');

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  var localStorage = new LocalStorage('./scratch');
}

router.use(lang.init);
/* GET users listing. */
router.get('/',isAuthenticated, function(req, res, next) {
 res.render('installation', { title: 'NiftyEWS',layout:"loginlayout",session:req.session,message:req.flash()});
});

router.post('/',isAuthenticated,function(req, res) {
	// we create 'users' collection in newdb database
	var dbname = req.body.dbname
	var url = "mongodb://127.0.0.1:27017/"+dbname;
	localStorage.setItem("database", dbname);  
	// create a client to mongodb
	// make client connect to mongo service
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		// db pointing to newdb
		console.log("Switched to "+db.databaseName+" database");
		// create 'users' collection in newdb database
		// db.createCollection("Access_Rights", function(err, Access_Rights) {
			// if (err) throw err;
		// db.createCollection("Generalsetting", function(err, Generalsetting) {
			// if (err) throw err;
		db.createCollection("Reminder", function(err, Reminder) {
			if (err) throw err;
		// db.createCollection("Role", function(err, Role) {
			// if (err) throw err;
		db.createCollection("Rule", function(err, Rule) {
			if (err) throw err;
		// db.createCollection("Users", function(err, Users) {
			// if (err) throw err;
		// db.createCollection("activitylog", function(err, activitylog) {
			// if (err) throw err;
		db.createCollection("category", function(err, category) {
			if (err) throw err;
		db.createCollection("categorytypes", function(err, categorytypes) {
			if (err) throw err;
		db.createCollection("custom_field_meta", function(err, custom_field_meta) {
			if (err) throw err;
		db.createCollection("customfields", function(err, customfields) {
			if (err) throw err;
		db.createCollection("emi_details", function(err, emi_details) {
			if (err) throw err;
		db.createCollection("events", function(err, events) {
			if (err) throw err;
		db.createCollection("familydata", function(err, familydata) {
			if (err) throw err;
		db.createCollection("loan_details", function(err, loan_details) {
			if (err) throw err;
		db.createCollection("loantype", function(err, loantype) {
			if (err) throw err;
		db.createCollection("notes", function(err, notes) {
			if (err) throw err;
		db.createCollection("notification_badges", function(err, notification_badges) {
			if (err) throw err;
		// db.createCollection("notificationtemplate", function(err, notificationtemplate) {
			// if (err) throw err;
		db.createCollection("product", function(err, product) {
			if (err) throw err;
		db.createCollection("service", function(err, service) {			
			// close the connection to db when you are done with it
		});});});});});});});});});});});});});});});
		db.collection("Role").insertMany( [
			{
				_id:ObjectId("5d5671a63d7d020a9857f935"),
				role_nm:"super admin",
				role_slug:"superadmin",
				role_desc:"super admin",
				admin_access:1,
				allow_access:1,
				status:1
			},
			{
				_id:ObjectId("5d5685d8c7053f2780bb0753"),
				role_nm:"Admin",
				role_slug:"admin",
				role_desc:"Admin",
				admin_access:1,
				allow_access:1,
				status:1
			},
			{
				_id:ObjectId("5d5ce97225a26b1fb45236ba"),
				role_nm:"Staff",
				role_slug:"staff",
				role_desc:"staff",
				admin_access:0,
				allow_access:1,
				status:0
			},
			{
				_id:ObjectId("5dca8556a33db915988ba532"),
				role_nm:"customer",
				role_slug:"customer",
				role_desc:"customer",
				admin_access:0,
				allow_access:1,
				status:0
			},
			{
				_id:ObjectId("5de8c45b0b29ca27380fa307"),
				role_nm:"Accountant",
				role_slug:"accountant",
				role_desc:"accountant",
				admin_access:0,
				allow_access:1,
				status:0
			}
		]);
		bcrypt.hash(req.body.password, 10, function(err, hash) {
			pass = hash
			myobj={
				firstname: "admin",
				middlename: "admin",
				lastname: "admin",
				email:req.body.email,
				photo:"default.png",
				ccode: "000",
				mobile:"9999999999",
				occupation:"admin",
				birthdate: Date(Date.now()),
				gender: "male",
				username: req.body.username,
				role:ObjectId("5d5685d8c7053f2780bb0753"),
				password: pass,
				address: "India",
				country:parseInt('000', 10),
				state:parseInt('000',10),
				city:parseInt('000',10),
				pincode:"000000",
				accountnumber:"00000000000",
				pannumber:"YYYYY0000Y",
				status:1,
			}
			db.collection("Users").insertOne(myobj, function(err, res) {
			db.collection("activitylog").insertOne({
				date: Date(Date.now()),
				module: "User",
				action: "inserted user named admin",
				user: ObjectId(res.insertedId),				
				item: req.body.username,
				status:0,
			});});
		});
		db.collection("Generalsetting").insertOne({
			_id:ObjectId("5d3ed73f5ec5ca0f0871f679"),
			business_type:"ITComapny",
			com_addr:"174 E. Wagon Street  Piscataway, NJ 08854",
			com_email:"alex@gmail.com",
			com_name:"Das",
			country_code:"111",
			email_bcc:"alex@gmail.com",
			footer_text:"CopyRight",
			gst_no:"174",
			phone:"2025550190",
			vat_no:"22222",
			zipcode:"48801",
			city:6088,
			company_logo:"1571226731963-Nifty-EWS.png",
			country:3,
			doctype:null,
			docupload_size:"11",
			imgtype:null,
			imgupload_size:"11",
			state:112,
			currency:"USD",
			date_format:"m/d/Y",
			language:"en",
			time_format:"24",
			imgtype_jpeg:"jpeg",
			imgtype_jpg:"jpg",
			imgtype_png:"png",
			Default_tax:"SALES TAX",
			auto_round_off:"1",
			currency_set:"1",
			decimal_separator:".",
			tax_item:"1",
			thousand_separator:".",
			bank_details:"Das Testing Bank Details",
			invoice_client_note:"AAAAA",
			invoice_number_format:"2",
			invoice_predefined_terms:"AAAA",
			invoice_prefix:"Das",
			number_length:"2222",
			font_size:"22",
			pdf_font:"22",
			pdf_format:"LETTER-PORTRAIT",
			pdf_logo_url:"www.logo.png",
			pdf_logo_width:"234",
			show_pdf_signature_creditnote:"1",
			show_pdf_signature_invoice:"1",
			show_transaction:null,
			signature_image:null,
			swap_header:"0",
			tbl_head_color:"#ddddd",
			tbl_head_txt_color:"#ddddd",
			doctype_Doc:"doc",
			doctype_Docx:"docx",
			doctype_Pdf:"pdf",
			doctype_Xls:"xls",
			doctype_Xlsx:"xlsx",
			doctype_Zip:"zip"});
		db.collection("Access_Rights").insertMany( [
			{_id:ObjectId("5def648b11f6a21a04ba80cc"),
			rolename:"customer",
			access_type:null},
			{_id:ObjectId("5def64b511f6a21a04ba80cd"),
			rolename:"accountant",
			access_type:null},
			{_id:ObjectId("5df718d29adfd900c82a4dc5"),
			rolename:"staff",
			access_type:null}
		]);
		db.collection("notificationtemplate").insertMany([
			{_id:ObjectId("5d8a049a3d22980b18c1624e"),notificationtype:"email",slug:"add user",templatetitle:"Added User",subject:"You are successully added at _systemname_.","content":"Dear _USERFIRSTNAME_ _USERLASTNAME_,_newline_ _tab_ You are successully added at _systemname_.  Your have been assigned role of _ROLENAME_  in _systemname_. You can access system using your username and password.  You can signin using this link. Your credentials are below : _newline__newline__tab_User Name : _username_,_newline__tab_Password : _password_ _newline__tab__link_._newline__tab__newline_Regards From  _systemname_."},

			{_id:ObjectId("5d8c6ff908cb970a6058eee9"),notificationtype:"email",slug:"Add Loan",templatetitle:"Loan Add",subject:"Loan added successfully.","content":"Dear _USERFIRSTNAME_ _USERLASTNAME_,_newline__tab_Your _LOANTYPE_ has been successfully added on _datetime_,Your EMI months will be starting from _LOANSTARTDATE_ and will end on _LOANENDDATE_ _newline_Regards From System Name."},

			{_id:ObjectId("5d8d9aa297f6bb2b8cbd2876"),notificationtype:"email",slug:"Loan Approved",templatetitle:"Loan Approved",subject:"Loan approved.","content":"Hello _USERFIRSTNAME_ _USERLASTNAME_, _newline__tab_Your _LOANTYPE_ has been approved. You can start your EMI as per time period._newline_Thank You."},

			{_id:ObjectId("5de1f5d158f0562cccc386d2"),notificationtype:"email",slug:"add event",templatetitle:"One day Event Added",subject:"Event added successfully.","content":"Dear _USERFIRSTNAME_ _USERLASTNAME_, _newline_Here is the new Event from _systemname_._newline_ _tab_Title : _EVENTNAME_.._newline_ _tab_Event Venue : _EVENTVENUE_.._newline_ _tab_Event Start Date : _EVENTSTARTDATE_.._newline_Regards From _systemname_."},

			{_id:ObjectId("5de1fe40fd51782ed08a3f24"),notificationtype:"email",slug:"add event",templatetitle:"Multiple days Event Added","subject":"Event added successfully","content":"Dear _USERFIRSTNAME_ _USERLASTNAME_,_newline_Here is the new Event from EWS._newline__tab_Title : _EVENTNAME_._newline__tab_Event Venue : _EVENTVENUE_._newline__tab_Event Start Date : _EVENTSTARTDATE_._newline__tab_Event EndDate : _EVENTENDDATE_._newline_Regards From _systemname_."},

			{_id:ObjectId("5dea1dc46b539e2704a5fd1c"),notificationtype:"email",slug:"update event",templatetitle:"one day event updated",subject:"Update in _EVENTNAME_ From _systemname_.","content":"Dear _USERFIRSTNAME_ _USERLASTNAME_, _newline__tab_Here is some updates in event _EVENTNAME_   from EWS._newline__tab_Title : _EVENTNAME_._newline__tab_Event Venue : _EVENTVENUE_._newline__tab_Event Start Date : _EVENTSTARTDATE_._newline_Regards From _systemname_."},

			{_id:ObjectId("5dea204e6b539e2704a5fd1e"),notificationtype:"email",slug:"update event",templatetitle:"multiple day event updated",subject:"Update in _EVENTNAME_ From _systemname_.","content":"Dear _USERFIRSTNAME_ _USERLASTNAME_, _newline__tab_Here is some updates in event _EVENTNAME_   from _systemname_._newline__tab__tab_Title : _EVENTNAME_._newline__tab__tab_Event Venue : _EVENTVENUE_._newline__tab__tab_Event Start Date : _EVENTSTARTDATE_._newline__tab__tab_Event EndDate : _EVENTENDDATE_._newline_Regards From _systemname_.\r\n"},

			{_id:ObjectId("5dea2bc728830f282c3ba42e"),notificationtype:"email",slug:"delete event",templatetitle:"one day event deleted",subject:"_EVENTNAME_  Cancelled From _systemname_.","content":"Dear _USERFIRSTNAME_ _USERLASTNAME_,_newline__tab__EVENTNAME_ has been cancelled._newline__tab__tab_Title : _EVENTNAME_._newline__tab__tab_Event Venue : _EVENTVENUE_._newline__tab__tab_Event Start Date : _EVENTSTARTDATE_. _newline_Regards From _systemname_."},

			{_id:ObjectId("5dea2c4028830f282c3ba431"),notificationtype:"email",slug:"delete event",templatetitle:"multiple day event deleted",subject:"_EVENTNAME_  Cancelled From _systemname_.","content":"Dear _USERFIRSTNAME_ _USERLASTNAME_,_newline__tab__EVENTNAME_ has been cancelled._newline__tab__tab_Title : _EVENTNAME_._newline__tab__tab_Event Venue : _EVENTVENUE_._newline__tab__tab_Event Start Date : _EVENTSTARTDATE_. _newline__tab__tab_Event EndDate : _EVENTENDDATE_._newline_Regards From _systemname_."},

			{_id:ObjectId("5df069667f4fd726c4d220a6"),notificationtype:"email",slug:"update user",templatetitle:"user profile updated",subject:"Profile Updated Succesfully at _systemname_","content":"Dear _USERFIRSTNAME_ _USERLASTNAME_,_newline__tab_Your Profile has been successfully Updated on _DATETIME_, _newline_Regards From _systemname_."},

			{_id:ObjectId("5df06fb80cba9c1f204f61e0"),notificationtype:"email",slug:"delete user",templatetitle:"user deleted",subject:"Your Account Deleted from _systemname_","content":"Dear _USERFIRSTNAME_ _USERLASTNAME_,_newline__tab_Your Profile has been deleted from _systemname_ on _DATETIME_, _newline_Regards From _systemname_."}
		])
	fs.writeFile('./temp/temp.txt', 'Never delete this file', function (err) {
	if (err) throw err;
	  console.log('File is created successfully.');
	});
	if (err) { 
		res.redirect('installation');
	}
	else{
		res.redirect('/');
	}
});
});

function isAuthenticated(req, res, next) {
	fs.exists('./temp/temp.txt', function(exists) {console.log("file exists ? " + exists);
		if(exists == true){
			res.redirect('/');
		}
		else {
			return next();			
		}
	});
};
module.exports = router;
