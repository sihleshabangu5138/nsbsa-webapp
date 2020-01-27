 var express = require('express');
var router = express.Router();
var db = require('./mongo_db');
var ObjectId = require('mongodb').ObjectId; 
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');

 
router.use(cookieParser());
router.use(session({ secret: '222222'}))
router.use(flash());

/* GET users listing. */
router.route('/:id?')
.get(isAuthenticated,function (req, res) {

	var xyz = db.get();
	var id = req.params.id;
	
    if (id){
		var myquery ={"_id": ObjectId(id)}; 
		var xyz=db.get();
		xyz.collection("notificationtemplate").find(myquery).toArray(function(err, result) {
			console.log(result);
			res.render('notification/addnotificationtemplate', {title:"Notification Template ", data: result,id:id,session:req.session}); 
		});
		}
	else{
        var news = [{'userid':'-1'}];
         //console.log("else");
        res.render('notification/addnotificationtemplate', {title:"Notification Template ", data: news,session:req.session});
    }
	
})
.post(isAuthenticated,function (req, res){
    var id = req.body.id;
	if(id){ 
	  	var myquery ={"_id": ObjectId(id)}; 
		console.log(id);
		var dbo = db.get();
		
		var newvalues = {$set: { 
		notificationtype: req.body.notificationtype,
		slug: req.body.slug,
		templatetitle: req.body.templatetitle,
		subject: req.body.subject,
		content: req.body.content,
		}};
		//console.log(newvalues)
		 
		dbo.collection("notificationtemplate").updateOne(myquery, newvalues , function(err, result) {
			
			if (err) { 
				req.flash('error','Error occured.');
				// console.log(req.flash())
				res.redirect('/notification/notificationtemplate');
			 }
			 else{ 
				 req.flash('success','Notification Template  Updated Sucessfully.');
				res.redirect('/notification/notificationtemplate');
			 }
		});

	} else {
		var dbo = db.get();
		var myobj = { 
		notificationtype: req.body.notificationtype,
		slug: req.body.slug,
		templatetitle: req.body.templatetitle,
		subject: req.body.subject,
		content: req.body.content,
		}; 
			dbo.collection("notificationtemplate").insertOne(myobj, function(err, result) {
			if (err) { 
				req.flash('error','Error occured.');
				// console.log(req.flash())
				res.redirect('/notification/notificationtemplate');
			 }
			 else{ 
				 req.flash('success','Notification Template Inserted Sucessfully.');
				res.redirect('/notification/notificationtemplate');
			 }
		});
		// res.redirect('/role/roles');
		}
	
})

function isAuthenticated(req, res, next) {
	
	if (req.session.username != undefined) {
		return next();
	} else {
		res.redirect('/');	
	}
	
};

module.exports = router;
