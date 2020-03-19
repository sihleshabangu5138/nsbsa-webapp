'use strict';
var express = require('express');
var router = express.Router();
var db = require('./mongo_db');
var ObjectId = require('mongodb').ObjectId;
var lang = require('./languageconfig'); 
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');

router.use(lang.init);
router.use(cookieParser());
router.use(session({ secret: '222222'}));
router.use(flash());

/* GET users listing. */
router.get('/', isAuthenticated,function(req, res, next) {
	var dbo = db.get();
	dbo.collection("activitylog").find().sort({ _id: -1 }).toArray(function(err, activity) {
		if(activity){
			var userquery ={"_id": activity[0].user};
			dbo.collection("Users").find(userquery).toArray(function(err, username) {
				res.render('activitylog/activitylog', { title: 'Activity Log',session:req.session,messages:req.flash(),activity:activity, user:username});
			});
		}
		else{
			var news = [{'userid':'-1'}];
			var userquery ={"_id": activity[0].user};
			dbo.collection("Users").find(userquery).toArray(function(err, username) {
				res.render('activitylog/activitylog', { title: 'Activity Log',session:req.session,messages:req.flash(),activity:news, user:username});
			});
		}
	});
});

function isAuthenticated(req, res, next) {
	var dbo = db.get();
	if (req.session.username != undefined) {
		if(req.session.admin_access == 1){
			 return next();
		}
		else{
			var query = {"rolename":req.session.role_slug};
			dbo.collection("Access_Rights").find(query).toArray(function(err, result) {
				if(result[0].access_type != undefined){
					if(result[0].access_type.activitylog != undefined){
						if(result[0].access_type.activitylog.view != undefined){
							return next();
						}
						else{
							res.redirect('/dashboard');	
						}
					}
					else{
						res.redirect('/dashboard');	
					}
				}
				else{
					res.redirect('/dashboard');	
				}
			});
		}
	}
	else {
		res.redirect('/');	
	}
};

module.exports = router;
