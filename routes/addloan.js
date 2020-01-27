var express = require('express');
var router = express.Router();
var http = require('http');
var db = require('./mongo_db');
var ObjectId = require('mongodb').ObjectId;
var bodyParser = require('body-parser');
var LoanJS = require('loanjs');
var AmortizeJS = require('amortizejs').Calculator;
var Mail = require('./email');
var lang = require('./languageconfig'); 
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var multer  =   require('multer');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false })

router.use(lang.init);
// var storage =   multer.diskStorage({
var storage =   multer.diskStorage({

// file upload destination
	destination: function (req, file, callback) {
		callback(null, 'public/images/upload/documents');
	},
	filename: function (req, file, callback) {
		callback(null, Date.now()+ '-' +file.originalname );
 
	 
		if (!file.originalname.match(/\.(pdf|xlsx|doc|docx)$/)) {
			// return callback(new Error('Only Document files are allowed!'), false);
		   (req.flash('Eroor_doc','Only Document files are allowed!'));
		}
	}
	
});

var upload = multer({ storage: storage});
 // limits: {fileSize: 30000000} 

router.use(cookieParser());
router.use(session({ secret: '222222'}))
router.use(flash());

router.route('/:id?')
.get(isAuthenticated,function (req, res) {
    var languages = lang.getLocale(); 
	var xyz = db.get();
	var id = req.params.id;
	var languages = lang.getLocale();
	
    if (id){
		var myquery ={"_id": ObjectId(id)}; 
		var xyz=db.get();
		var result_data=[];
		xyz.collection("loan_details").find(myquery).toArray(function(err, result) {
			
			result_data=result;
			result_data[0].id_d=ObjectId(result_data[0].user).toString();
		var query ={status:1};
		xyz.collection("Users").find(query).toArray(function(err, User_name) {
			for (const [key,value] of Object.entries(User_name)) {
				User_name[key].id_d=ObjectId(value._id).toString();
			};
			xyz.collection("loantype").find().toArray(function(err, loan_type) {
			for (const [key,value] of Object.entries(loan_type)) {
				loan_type[key].id_d=ObjectId(value._id).toString();
			};

			xyz.collection("Generalsetting").find().toArray(function(err, geninfo) {
			for (const [key,value] of Object.entries(geninfo)) {
				User_name[key].id_d=ObjectId(value._id).toString();
			};
			console.log(geninfo);
			res.render('loan/addloan', {title:"Add Loan", data: result_data,id:id,session:req.session,user:User_name,loan:loan_type,geninfo:geninfo,setlang:languages});
		});

		});
		});
		});
		}
	else{
		var query ={status:1};
		xyz.collection("Users").find(query).toArray(function(err, User_name) {
			xyz.collection("loantype").find().toArray(function(err, loan_type) {
				xyz.collection("Generalsetting").find().toArray(function(err, geninfo) {
			for (const [key,value] of Object.entries(geninfo)) {
				User_name[key].id_d=ObjectId(value._id).toString();
			};
        var news = [{'userid':'-1'}];
        res.render('loan/addloan', {title:"Add Loan",data: news,session:req.session,user:User_name,loan:loan_type,geninfo:geninfo});
	})
	})
	})
}
})


.post( upload.array('document',5),isAuthenticated,function (req, res){

    var id = req.body.id;
    var data = [];
   
		req.files.forEach(element => {
		  data.push(element.filename);
		});
		if(id){
	  	var myquery ={"_id": ObjectId(id)};
		var dbo = db.get();

		if(req.file != undefined){
			var doc=req.file.filename;
		}
		else{
			var doc=req.body.doc_old;
		}

		
		var doc1=req.body.doc_old;
		console.log(doc1);
		 if(doc1 != undefined){
			doc1.forEach(element => {
				data.push(element);
			});
		 }

		var userid = req.body.user;
		var iduser = ObjectId(userid);
		var newvalues = {$set: {
			loancount:req.body.loancount,
			loantype: req.body.loantype,
			user: iduser,
			description: req.body.description,
			document:data,
			loanamount:req.body.loanamount,
			interestrate:req.body.interestrate,
			years:req.body.years,
			startdate:req.body.startdate,
			nofpayments:req.body.nofpayments,
			epayment:req.body.epayment,
			interest:req.body.interest,
			enddate:req.body.enddate,
			totalemimonth:req.body.totalemimonth,
			incomeperyear:req.body.incomeperyear,
			incomepermonth:req.body.incomepermonth,
			oincome:req.body.oincome,
			workdetail:req.body.workdetail,
			colleague:req.body.colleague,
			address:req.body.address,
			mobile:req.body.mobile,
			addtype:req.body.addtype,
			othertext:req.body.othertext,
		}};
		dbo.collection("loan_details").updateOne(myquery, newvalues , function(err, result) {

			if (err) { 
				req.flash('error','Error occured.');
				console.log(req.flash())
				res.redirect('/loan/loanlist');
			 }
			 else{ 
				 req.flash('success','Loan Updated Sucessfully.');
				res.redirect('/loan/loanlist');
			 }
		});
	}
	else {
		var dbo = db.get();
		var userid = req.body.user;
		var iduser = ObjectId(userid);
		var type = req.body.loantype;
		var loantype = ObjectId(type);
		
		var myobj = {
		loancount:req.body.loancount,
		loantype: loantype,
		user: iduser,
		description: req.body.description,
		document:data,
		loanamount:req.body.loanamount,
		interestrate:req.body.interestrate,
		years:req.body.years,
		paymentsperyear:req.body.paymentsperyear,
		startdate:req.body.startdate,
		enddate:req.body.enddate,
		nofpayments:req.body.nofpayments,
		epayment:req.body.epayment,
		interest:req.body.interest,
		enddate:req.body.enddate,
		totalemimonth:req.body.totalemimonth,
		incomeperyear:req.body.incomeperyear,
		incomepermonth:req.body.incomepermonth,
		oincome:req.body.oincome,
		workdetail:req.body.workdetail,
		colleague:req.body.colleague,
		address:req.body.address,
		mobile:req.body.mobile,
		addtype:req.body.addtype,
		othertext:req.body.othertext,
		status:1,
		approvestatus: parseInt("0"),
		};
			dbo.collection("loan_details").insertOne(myobj,function(err, resultes) {
			dbo.collection("Users").find(iduser).toArray(function(err, result) {
				dbo.collection("notificationtemplate").find({templatetitle:"Loan Add"}).toArray(function(err, notification) {
			dbo.collection("loantype").find(loantype).toArray(function(err, typeloan) {
				console.log(typeloan);
				for (const [key,value] of Object.entries(notification)){
				var message = value.content;
				var subject = value.subject;
					var Obj = {
							'_USERFIRSTNAME_': result[0].firstname, 
							'_USERLASTNAME_': result[0].lastname, 
							'_LOANTYPE_': typeloan[0].type, 
						};
					var trans=message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_LOANTYPE_/gi, function(matched){ 
						return Obj[matched]; 
					});  
					console.log(trans);
				Mail.sendMail(result[0].email,subject,trans);
				};			
			});
			
			var mortgage = AmortizeJS.calculate({
				method:   'mortgage',
				apr:      req.body.interest,
				balance:  req.body.loanamount,    
				loanTerm: req.body.totalemimonth,         
				startDate: req.body.startdate,
			});
			console.log(mortgage);
			
			var data = [];
			var index_id=1;
				mortgage.schedule.forEach(element => {
						
				var this_news = { 
					loan_id: resultes.insertedId,
					user_id: iduser,
					month: index_id,
					interest: element.interest,
					principal: element.principal,
					remainingBalance: element.remainingBalance,
					date: element.date,
					status:0,
				}
				index_id++;
					data.push(this_news);
				});
			dbo.collection("emi_details").insertMany(data,function(err, result) {
				console.log("Emi inserted");
			});
			if (err) { 
				req.flash('error','Error occured.');
				// console.log(req.flash())
				res.redirect('/loan/disapproveloan');
			}
			else{ 
				req.flash('success','Loan Inserted Sucessfully.');
				res.redirect('/loan/disapproveloan');
			}
		});
		});
		});
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