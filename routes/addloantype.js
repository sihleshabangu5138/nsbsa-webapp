var express = require('express');
var router = express.Router();
var http = require('http');
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

router.route('/:id?')
.get(isAuthenticated,function (req, res) {
    var languages = lang.getLocale(); 
	var xyz = db.get();
	var id = req.params.id;
	
    if (id){
		var myquery ={"_id": ObjectId(id)}; 
		var xyz=db.get();
		xyz.collection("loantype").find(myquery).toArray(function(err, result) {
			console.log(result);
			res.render('loan/addloantype', {title:"Loan Types", data: result,id:id,session:req.session,setlang:languages}); 
		});
		}
	else{
        var news = [{'userid':'-1'}];
         //console.log("else");
        res.render('loan/addloantype', {title:"Loan Types", data: news,session:req.session});
    }
	
})
.post(isAuthenticated,function (req, res){
    var id = req.body.id;
	if(id){ 
	  	var myquery ={"_id": ObjectId(id)}; 
		console.log(id);
		var dbo = db.get();
		
		var newvalues = {$set: { 
		type: req.body.type,
		loan_desc: req.body.loan_desc,
		loan_min_amount: req.body.loan_min_amount,
		loan_max_amount: req.body.loan_max_amount,
		interestrate: req.body.interestrate,
	
		}};
		//console.log(newvalues)
		 
		dbo.collection("loantype").updateOne(myquery, newvalues , function(err, result) {
			
			if (err) { 
				req.flash('error','Error occured.');
				// console.log(req.flash())
				res.redirect('/loan/loantypelist');
			 }
			 else{ 
				 req.flash('success','Loan Type Updated Sucessfully.');
				res.redirect('/loan/loantypelist');
			 }
		});

	} else {
		var dbo = db.get();
		var myobj = { 
		type: req.body.type,
		loan_desc: req.body.loan_desc,
		loan_min_amount: req.body.loan_min_amount,
		loan_max_amount: req.body.loan_max_amount,
		interestrate: req.body.interestrate,
		}; 
			dbo.collection("loantype").insertOne(myobj, newvalues, function(err, result) {
			if (err) { 
				req.flash('error','Error occured.');
				// console.log(req.flash())
				res.redirect('/loan/loantypelist');
			 }
			 else{ 
				 req.flash('success','Loan Type Inserted Sucessfully.');
				res.redirect('/loan/loantypelist');
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