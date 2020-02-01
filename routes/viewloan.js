var express = require('express');
var router = express.Router();
var http = require('http');
var db = require('./mongo_db');
var ObjectId = require('mongodb').ObjectId;
var bodyParser = require('body-parser');
var fs = require('fs');
var LoanJS = require('loanjs');
var lang = require('./languageconfig');
router.use(lang.init);

/* GET users listing. */
router.route('/:id?')
.get(isAuthenticated,function (req, res) {
	var dbo = db.get();
	var id = req.params.id;
	if (id){
		var myquery ={"_id": ObjectId(id)}; 
		 
		var dbo = db.get("BankingSystem");
		var result_data=[];
		
		dbo.collection("loan_details").find(myquery).toArray(function(err, result) {
			
			if (err) throw err;
			result_data=result;

			var loanquery ={"_id": result[0].loantype};
			var query ={"_id": result[0].user}; 

			 var loanid ={"loan_id": ObjectId(id)};
			dbo.collection("Users").find(query).toArray(function(err, result1) {
			dbo.collection("loantype").find(loanquery).toArray(function(err, typeofloan) {
			dbo.collection("Re_Payments").find().toArray(function(err, repayment) {
				if (err) throw err;
				dbo.collection("emi_details").find(loanid).toArray(function(err, emilist) {
			res.render('loan/viewloan', {title:"View Loan", emi:emilist, type:typeofloan,repayment:repayment,data: result_data,user:result1,id:id,session:req.session}); 

		});	 
		});	 
	});	 
	});
    });
    }	
	else{
        var news = [{'userid':'-1'}];
        res.render('loan/viewloan', {title:"View Loan",data: news,family:news,session:req.session});
    }
});
	
	
function isAuthenticated(req, res, next) {
	if (req.session.username != undefined) {
		 return next();
	}
	else {
		res.redirect('/');	
	}	
};

module.exports = router;
