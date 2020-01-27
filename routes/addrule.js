var express = require('express');
var router = express.Router();
var http = require('http');
var db = require('./mongo_db');
var ObjectId = require('mongodb').ObjectId;
var lang = require('./languageconfig');
router.use(lang.init);

var bodyParser = require('body-parser');
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');

// FOR IMAGE SAVE
var multer  =   require('multer');
var app = express();
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var storage =   multer.diskStorage({

// file upload destination
	destination: function (req, file, callback) {
		callback(null, 'public/images/upload');
	},
	filename: function (req, file, callback) {
		callback(null, Date.now()+ '-' +file.originalname );
	}
});
var upload = multer({ storage: storage })
// IMAGE SAVE END


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
		xyz.collection("Rule").find(myquery).toArray(function(err, result) {
		
		res.render('rule/addrule', { title:"Add Rule",data: result,id:id,session:req.session}); 
		});
		}
	
	else{
        var news = [{'userid':'-1'}];
         //console.log("else");
        res.render('rule/addrule', {title:"Add Rule", data: news,session:req.session});
    }
	
})
.post(upload.single('rule_image'), isAuthenticated,function (req, res){
    var id = req.body.id;
	console.log(req.body);
	if(id){   
	  	var myquery ={"_id": ObjectId(id)}; 
		var dbo = db.get();
		 		console.log(dbo);
		if(req.file != undefined){
			var rule_image = req.file.filename;
		}
		else{
			var rule_image = req.body.rule_photo_old;
		}
			var newvalues = {$set: { 
		loantype: req.body.loantype,
		rule_title: req.body.rule_title,
		rule_desc: req.body.rule_desc,
		loan_amount_rule: req.body.loan_amount_rule,
		rule_image: req.body.rule_image
		
		}};
		  
		dbo.collection("Rule").updateOne(myquery, newvalues , function(err, result) {
			
			if (err) { 
				req.flash('error','Error occured.');
				// console.log(req.flash())
				res.redirect('/rule/rules');
			 }
			 else{ 
				 req.flash('success','Rules Updated Sucessfully.');
				res.redirect('/rule/rules');
			 }
		});

	} else {
		
		var dbo = db.get();
		
		if(req.file != undefined){
			var rule_image1 = req.file.filename;
		}
		else{
			var rule_image1 = req.body.rule_photo_old;
		}
		var myobj = { 
		loantype: req.body.loantype,
		rule_title: req.body.rule_title,
		rule_desc: req.body.rule_desc,
		rule_image: rule_image1,
		loan_amount_rule: req.body.loan_amount_rule,
		};   
			dbo.collection("Rule").insertOne(myobj, newvalues, function(err, result) {
			if (err) { 
				req.flash('error','Error occured.');
				res.redirect('/rule/rules');
			 }
			 else{ 
				 req.flash('success','Rule Inserted Sucessfully.');
				res.redirect('/rule/rules');
			 }
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