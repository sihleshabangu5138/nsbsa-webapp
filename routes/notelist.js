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
router.use(session({ secret: '222222'}))
router.use(flash());


/* GET users listing. */
router.get('/', isAuthenticated,function(req, res, next) {
	var dbo = db.get();
	var myquery ={"rolename": req.session.role_slug}; 
				var access_data=[];	
				dbo.collection("Access_Rights").find(myquery).toArray(function(err, access) {
					 
					for (const [key,value] of Object.entries(access)) {
					 
							for (const [key1,value1] of Object.entries(value['access_type'])) {
								if(key1=="notes"){
									access_data=value1;
								} 
							} 
					};
	res.render('notes/notelist', { title: 'Notes',session:req.session,messages:req.flash(),accessrightdata:access_data});
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
					if(result[0].access_type.notes != undefined){
						if(result[0].access_type.notes.view != undefined){
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
