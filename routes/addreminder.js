 var express = require('express');
 var app = express();
var router = express.Router();
var http = require('http');
var db = require('./mongo_db');
var ObjectId = require('mongodb').ObjectId;
var bodyParser = require('body-parser');
var md5 = require('md5');
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var fs = require('fs'); 
var Mail = require('./email');
var lang = require('./languageconfig');

router.use(lang.init); 
// FOR IMAGE SAVE
var multer  =   require('multer');

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
		if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
    }
}
});
var upload = multer({ storage: storage })
// IMAGE SAVE END

// FOR GETTING VALUE IN FORM EDIT
router.use(cookieParser());
router.use(session({ secret: '222222'}))
router.use(flash());
 

router.route('/:id?')
//.get(isAuthenticated,function (req, res) {
.get(isAuthenticated,function (req, res) {
	var languages = lang.getLocale();
	var xyz = db.get();
	var id = req.params.id;
	global.msg=1
    if (id){
		var myquery ={"_id": ObjectId(id)}; 
		var xyz=db.get();
		var result_data=[];
			xyz.collection("Reminder").find(myquery).toArray(function(err, result) {
					result_data=result;
					result_data[0].id_d=ObjectId(result_data[0].role).toString();
					
				var query ={"user_id": ObjectId(id)};
				 res.render('reminder/addreminder', {title:"Add Reminder",data: result_data,id:id,session:req.session,setlang:languages});
			});
			}
	else{
		  
		var news = [{'reminderdata':{'1':'1'}}];
          
			// var jsonData = data;
			// var jsonParsed = JSON.parse(jsonData);
		 res.render('reminder/addreminder', {title:"Add Reminder", data: news,session:req.session});
		 
	} 
    
})
// FOR FORM UPDATE AND ADD
.post(upload.single('photo'),isAuthenticated,function (req, res){
    var id = req.body.id; 
	console.log(req.body);
	//console.log(req.file);
	var data = [];
				console.log(req.body.reminderdata);
				req.body.reminderdata.forEach(element => {
				   
				var this_news = { 
					number: element.number,
					recurense: element.recurense, 
				}
					data.push(this_news);
				});
	if(id){ 
		var myquery ={"_id": ObjectId(id)}; 
		var dbo = db.get(); 
		var newvalues = {$set: {  
		     reminder_nm: req.body.reminder_nm,
			 reminder_template: req.body.reminder_template,
			 reminder_desc: req.body.reminder_desc,
			 reminder_will_send: req.body.reminder_will_send,
			 reminder_type: req.body.reminder_type, 
			 reminderdata:data,
		}};
		// var data = [];
			// for (const [key, value] of Object.entries(req.body.family123)) {
					// var newval = {$set:{	
						// number: value.number,
						// recurense: value.recurense,
				  // }};
				
		 //console.log(newvalues);
		 dbo.collection("Reminder").updateOne(myquery, newvalues, function(err, result) { 
			
			 // if (err) throw err;
				if (err) { 
				req.flash('error','Error occured.');
				// console.log(req.flash())
				res.redirect('/reminder/reminders');
			 }
			 else{ 
				 req.flash('success','Reminder Updated Sucessfully.');
				res.redirect('/reminder/reminders');
			 } 
			});		
			// }
			
		}
	else{
		var dbo = db.get(); 
		 // var data = [];
				// console.log(req.body.family123);
				// req.body.family123.forEach(element => {
				   
				// var this_news = { 
					// number: element.number,
					// recurense: element.recurense, 
				// }
					// data.push(this_news);
				// });
		console.log(data);
		var myobj = {  
		     reminder_nm: req.body.reminder_nm,
			 reminder_template: req.body.reminder_template,
			 reminder_desc: req.body.reminder_desc,
			 reminder_will_send: req.body.reminder_will_send,  
			 reminder_type: req.body.reminder_type,
			 reminderdata:data,
		};

		 dbo.collection("Reminder").insertOne(myobj, function(err, result) {
			//console.log(result);
			// if (err) throw err;
				    if (err) {
						req.flash('error','Error occured.');
						res.redirect('/reminder/reminders');
					 }
					 else{
						 req.flash('success','Reminder Inserted Sucessfully.');
						 res.redirect('/reminder/reminders');
					 } 
				console.log("1 document inserted");
				
				// console.log(data);
				// dbo.collection("familydata").insertMany(data, function(err, result) {
					 
				// });	
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