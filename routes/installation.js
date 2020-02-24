var express = require('express');
var router = express.Router();
var lang = require('./languageconfig');
router.use(lang.init);
/* GET users listing. */
router.get('/', function(req, res, next) {
 res.render('installation', { title: 'NiftyEWS',layout:"loginlayout",session:req.session,message:req.flash()});
});

router.post('/',function(req, res) {
	console.log("Post method")
	// we create 'users' collection in newdb database
	var dbname = req.body.dbname
	var url = "mongodb://localhost:27017/"+dbname;
	 
	// create a client to mongodb
	var MongoClient = require('mongodb').MongoClient;
	 
	// make client connect to mongo service
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		// db pointing to newdb
		console.log("Switched to "+db.databaseName+" database");
		// create 'users' collection in newdb database
		db.createCollection("Access_Rights", function(err, Access_Rights) {
			if (err) throw err;
		db.createCollection("Generalsetting", function(err, Generalsetting) {
			if (err) throw err;
		db.createCollection("Reminder", function(err, Reminder) {
			if (err) throw err;
		db.createCollection("Role", function(err, Role) {
			if (err) throw err;
		db.createCollection("Rule", function(err, Rule) {
			if (err) throw err;
		db.createCollection("Users", function(err, Users) {
			if (err) throw err;
		db.createCollection("activitylog", function(err, activitylog) {
			if (err) throw err;
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
		db.createCollection("notificationtemplate", function(err, notificationtemplate) {
			if (err) throw err;
		db.createCollection("product", function(err, product) {
			if (err) throw err;
		db.createCollection("service", function(err, service) {
			if (err) {
				console.log(err);
			}
			else{
				console.log("Collection is created!");
				res.render("login",{ title: 'NiftyEWS',layout:"loginlayout",session:req.session,message:req.flash()});
			}
			// close the connection to db when you are done with it
		});});});});});});});});});});});});});});});});});});});});});
	});
})
module.exports = router;
