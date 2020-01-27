var express = require('express');
var router = express.Router();
var db = require('./mongo_db');
var ObjectId = require('mongodb').ObjectId;
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var lang = require('./languageconfig');    

router.use(cookieParser());
router.use(session({ secret: '222222'}))
router.use(flash());
 
router.use(lang.init);
 
/* GET home page. */
router.get('/',isAuthenticated, function(req, res, next) { 
		var dbo = db.get("BankingSystem"); 
		dbo.collection("Generalsetting").find().toArray(function(err, result) { 
			lang.setLocale(result[0].language); 
			res.cookie('locale', result[0].language, { maxAge: 90000000, httpOnly: true });
		 
		var languages = lang.getLocale();
		console.log("Helooooooooooooooooo");
		console.log(languages);
		console.log(result[0].language);
		var query = {status : 1};
		dbo.collection("Users").count((query), function(error, activeuser){
			//var percent = activeuser * 100 +"%"; console.log(percent);
            if(error) return callback(error);
			console.log(languages);
			// console.log();
		dbo.collection("loan_details").count((query), function(error, num_of_loan){
            if(error) return callback(error); 
		res.render('index', { title:"Dashboard",session:req.session,activecount:activeuser,loanno:num_of_loan,setlang:languages });
		
		});
});
});
});

function isAuthenticated(req, res, next) {
if (req.session.username != undefined) {
return next();
} else {
res.redirect('/');
}

};

module.exports = router;