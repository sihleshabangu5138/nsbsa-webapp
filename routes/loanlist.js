var express = require('express');
var router = express.Router();
var db = require('./mongo_db');
var ObjectId = require('mongodb').ObjectId;
var lang = require('./languageconfig');

router.use(lang.init); 
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');

router.use(cookieParser());
router.use(session({ secret: '222222'}))
router.use(flash());

/* GET loan listing. */
router.get('/',isAuthenticated, function(req, res, next) {
	var dbo = db.get("BankingSystem");
          dbo.collection("loan_details").count({}, function(error, numOfDocs){
            if(error) return callback(error);
				console.log(numOfDocs);
				
		var query = { $and: [ {status : 1 },{approvestatus : 1 }] };
		dbo.collection("loan_details").count((query), function(error, approveloan){
            if(error) return callback(error);
				console.log(approveloan);
				
		var query = { $and: [ {status : 1 },{approvestatus : 0 }] };
        dbo.collection("loan_details").count((query), function(error, disapproveloan){
            if(error) return callback(error);
		var path=__basedir+"/public/images/upload/";
		var path1=__basedir;
		// console.log(req.flash())
		res.render('loan/loanlist', { title: 'Loans', path : path, path1:path1,session:req.session,count:numOfDocs,approveloan:approveloan,disapproveloan:disapproveloan,messages:req.flash()});
});
});
});
});
router.get('/delete/:id',isAuthenticated, function(req, res) { 
	var dbo = db.get("BankingSystem");
    var id = req.params.id;
	console.log(id);
	var myquery = { _id: id };
	dbo.collection("loan_details").remove({_id: new ObjectId(id)}, function(err, result){
        if (err) { 
        } 
	});
	res.redirect('/loan/loanlist');
});

function isAuthenticated(req, res, next) {
	
	if (req.session.username != undefined) {
		 return next();
	} else {
		res.redirect('/');	
	}
	
};

module.exports = router;
