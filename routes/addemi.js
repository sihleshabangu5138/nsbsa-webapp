var express = require('express');
var router = express.Router();
var session = require('express-session');
var http = require('http');
var db = require('./mongo_db');
var ObjectId = require('mongodb').ObjectId;
var lang = require('./languageconfig');
var dateFormat = require('dateformat');

router.use(lang.init); 
/* GET home page. */
router.route('/:id?')
.get(isAuthenticated,function (req, res) {
	var time = dateFormat("Jun 9 2007", "fullDate");
	var xyz = db.get();
	var id = req.params.id;
	if (id){
		var myquery ={"_id": ObjectId(id)}; 
		var dbo = db.get("BankingSystem");
		var result_data=[];
		
		xyz.collection("emi_details").find(myquery).toArray(function(err, result) {
			if (err) throw err;
			result_data=result;
			var loanid ={"_id": result[0].loan_id}; 
				if (err) throw err;
				xyz.collection("loan_details").find(loanid).toArray(function(err, loanlist) {
					var type ={"_id": loanlist[0].loantype};
				xyz.collection("loantype").find(type).toArray(function(err, typeofloan) {
					
			res.render('loan/addemi', {title:"Add EMI", loan:loanlist, data: result_data,type:typeofloan,id:id,session:req.session}); 
		});	 
		});	 
		});	 
    } 	 
	else{
        var news = [{'userid':'-1'}];
        res.render('loan/addemi', {title:"Add EMI",data: news,family:news,session:req.session});
    }
})
.post(isAuthenticated,function (req, res){
	var dbo = db.get("BankingSystem");
	var id = req.body.id;
	console.log("456456456456456456456");
	console.log(id); 
	var myquery ={"_id": ObjectId(id)};
	if(id){
	var newvalues = {$set: {
		status:1,
	}};
	console.log(newvalues);
	dbo.collection("emi_details").updateOne(myquery, newvalues , function(err, result) {
		if (err) { 
				req.flash('error','Error occured.');
				console.log(req.flash())
				res.redirect('/loan/loanlist');
			 }
			 else{ 
				 req.flash('success','Emi paid Sucessfully.');
				res.redirect('/loan/loanlist');
			 }
	});
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