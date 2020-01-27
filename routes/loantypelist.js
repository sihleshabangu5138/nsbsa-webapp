var express = require('express');
var router = express.Router();
var db = require('./mongo_db');
var ObjectId = require('mongodb').ObjectId;
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var lang = require('./languageconfig');

router.use(lang.init); 
router.use(cookieParser());
router.use(session({ secret: '222222'}))
router.use(flash());

/* GET users listing. */
router.get('/',isAuthenticated, function(req, res, next) {
	var dbo = db.get("BankingSystem");
		res.render('loan/loantypelist', { title: 'Types of Loan',session:req.session,messages:req.flash()});
});

function isAuthenticated(req, res, next) {
	
	if (req.session.username != undefined) {
		 return next();
	} else {
		res.redirect('/');	
	}
	
};

module.exports = router;
