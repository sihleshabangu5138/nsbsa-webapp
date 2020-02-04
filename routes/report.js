 var express = require('express');
var router = express.Router();
var db = require('./mongo_db');
var ObjectId = require('mongodb').ObjectId;
var lang = require('./languageconfig'); 
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var moment = require('moment');

router.use(lang.init);
router.use(cookieParser());
router.use(session({ secret: '222222'}));
router.use(flash());


router.get('/', isAuthenticated,function(req, res, next) {
	var dbo = db.get("BankingSystem"); 
	var query = {status : 1};
	var myquery = {status : 0};
	var mysquery = {approvestatus : 0};
	var mylquery = {approvestatus : 1};
	dbo.collection("Users").count((query), function(error, activeuser){
	dbo.collection("Users").count((myquery), function(error, deactiveuser){
		if(error) return callback(error);
	dbo.collection("loan_details").count((mylquery), function(error, num_of_loan){
	dbo.collection("loan_details").count((mysquery), function(error, num_of_disloan){
		if(error) return callback(error); 
	res.render('report/report', { title: 'report',session:req.session,messages:req.flash(),activecount:activeuser,loanno:num_of_loan,deactivecount:deactiveuser,deloanno:num_of_disloan});
 
});
});
});
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
				if(req.url == "/"){
					if(result[0].access_type != undefined){
						if(result[0].access_type.category != undefined){
							if(result[0].access_type.category.add != undefined){
								return next();
							}
							else{
								res.redirect('/dashboard');	
							}
						}
					}
				}
				else{
					if(result[0].access_type != undefined){
						if(result[0].access_type.category != undefined){
							if(result[0].access_type.category.update != undefined){
								return next();
							}
							else{
								res.redirect('/dashboard');	
							}
						}
					}
				}
			});
		}
	}
	else {
		res.redirect('/');	
	}
};
module.exports = router;
