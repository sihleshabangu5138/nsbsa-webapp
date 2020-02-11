var express = require('express');
var router = express.Router();
var http = require('http');
var db = require('./mongo_db');
var ObjectId = require('mongodb').ObjectId;
var Mail = require('./email');
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var lang = require('./languageconfig');
var multer  =   require('multer');
var passarray = multer();

router.use(lang.init); 
router.use(cookieParser());
router.use(session({ secret: '222222'}));
router.use(flash());

router.route('/:id?')
.get(isAuthenticated,function (req, res) { 
	var dbo=db.get();
	var query = {"status":0};
	dbo.collection("Role").find(query).toArray(function(err, result) { 
	    dbo.collection("Access_Rights").find().toArray(function(err, access) { 
			res.render('accessrights/accessright', {title:"Access Rights",session:req.session, messages:req.flash(), accessrightdata:access, roledata: result});
		});
	});
})
.post(passarray.array(),isAuthenticated,function (req, res){   
	var id = req.body.id;
	var dbo = db.get(); 
	if(id){
		var myquery ={"rolename": req.body.role_name};
		var newvalues = {$set: { 
			  rolename: req.body.role_name,
			  access_type: req.body.accessrights,
		}}; 
		dbo.collection("Access_Rights").updateOne( myquery,newvalues , function(err, access) { 
		dbo.collection("Access_Rights").find(myquery).toArray(function(err, accessdata) { 
			
				req.session.access_rights = accessdata[0].access_type;
			
			if (err) { 
				req.flash('error','Error occured.');
				res.redirect('/accessrights/accessright');
			 }
			 else{ 
				 req.flash('success',lang.__('Access_Rights Updated Sucessfully.'));
				 if(req.session.access_rights != undefined){
				 if(req.session.access_rights.access != undefined){
					 res.redirect('/accessrights/accessright');
				 }
				 }
				 else{
					res.redirect('/dashboard');
					req.session.access_rights = accessdata[0].access_type;
				 }
			 }	
		});
		});
	}
	else{
		var myobj = { 
			 rolename: req.body.role_name,
			 access_type: req.body.accessrights,
		};
		dbo.collection("Access_Rights").insertOne(myobj, function(err, access) {		
			if (err){ 
				req.flash('error','Error occured.');
				res.redirect('/accessrights/accessright');
			 }
			 else{ 
				 req.flash('success',lang.__('Access_Rights Updated Sucessfully.'));
				res.redirect('/accessrights/accessright');
			 }
		});
	} 
}) 
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
					if(result[0].access_type.access != undefined){
						if(result[0].access_type.access.view != undefined){
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