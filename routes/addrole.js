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

router.use(lang.init); 
router.use(cookieParser());
router.use(session({ secret: '222222'}))
router.use(flash());

router.route('/:id?')
.get(isAuthenticated,function (req, res) {

	var xyz = db.get();
	var id = req.params.id;
	
    if (id){
		var myquery ={"_id": ObjectId(id)}; 
		var xyz=db.get();
		xyz.collection("Role").find(myquery).toArray(function(err, result) {
		
		res.render('role/addrole', {title:"Add Role", data: result,id:id,session:req.session}); 
		});
		}
	
	else{
        var news = [{'userid':'-1'}];
         //console.log("else");
        res.render('role/addrole', {title:"Add Role", data: news,session:req.session});
    }
	
})
.post(isAuthenticated,function (req, res){
    var id = req.body.id;
	if(id){ 
	  	var myquery ={"_id": ObjectId(id)}; 
		var dbo = db.get();
		 
		 
		var name1 =req.body.admin_access;
		var name2 =req.body.allow_access;
		 
		if(name1=='on'){
			 
			var value1= 1;
			
		} else {
			var value1= 0;
			
		}
		
		if(name2=='on'){
			 
			var value2= 1;
			
		} else {
			var value2= 0;
			
		}
		/* var newvalues_admin = {$set: { 
			admin_access:value
			}
			}; */
			var newvalues = {$set: { 
		role_nm: req.body.role_nm,
		role_slug: req.body.role_slug,
		role_desc: req.body.role_desc,
		//admin_access:req.body.admin_access,
		admin_access:value1,
		allow_access:value2
		}};
		//console.log(newvalues)
		 
		dbo.collection("Role").updateOne(myquery, newvalues , function(err, result) {
			
			if (err) { 
				req.flash('error','Error occured.');
				// console.log(req.flash())
				res.redirect('/role/roles');
			 }
			 else{ 
				 req.flash('success','Role Updated Sucessfully.');
				res.redirect('/role/roles');
			 }
		});

	} else {
		
		var dbo = db.get();
		var myobj = { 
		role_nm: req.body.role_nm,
		role_slug: req.body.role_slug,
		role_desc: req.body.role_desc,
		admin_access:req.body.admin_access,
		allow_access:req.body.allow_access
		}; 
			dbo.collection("Role").insertOne(myobj, newvalues, function(err, result) {
			if (err) { 
				req.flash('error','Error occured.');
				// console.log(req.flash())
				res.redirect('/role/roles');
			 }
			 else{ 
				 req.flash('success','Role Inserted Sucessfully.');
				res.redirect('/role/roles');
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