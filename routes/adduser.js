var express = require('express');
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
.get(isAuthenticated,function (req, res) {
	var languages = lang.getLocale();
	var xyz = db.get();
	var id = req.params.id;
	global.msg=1;
	console.log("Helooooooooooooooooo");
	console.log(languages);
    if (id){
		var myquery ={"_id": ObjectId(id)}; 
		var xyz=db.get();
		var result_data=[];
			xyz.collection("Users").find(myquery).toArray(function(err, result) {
					result_data=result;
					result_data[0].id_d=ObjectId(result_data[0].role).toString();
					
				var query ={"user_id": ObjectId(id)};
				
				var family_data=[];
					xyz.collection("familydata").find(query).toArray(function(err, family_data1) {
						family_data=family_data1;
						family_data[0].id_d=ObjectId(family_data1[0]._id).toString();
						
						xyz.collection("Role").find().toArray(function(err, role_name) {
							
				fs.readFile('public/data/countries.json', function(err, data) { 
					var jsonData = data;
					var jsonParsed = JSON.parse(jsonData);

					for (const [key,value] of Object.entries(role_name)) {
						
						role_name[key].id_d=ObjectId(value._id).toString();
						
					};
					xyz.collection("Generalsetting").find().toArray(function(err, setting) {

				res.render('users/adduser', {title:"Add User",data: result_data,id:id,role:role_name,family:family_data,session:req.session,country:jsonParsed.countries,setting:setting, setlang:languages});

				});	
				});
				});
				});
			});
			}
	else{
		xyz.collection("Role").find().toArray(function(err, role_name) { 
		var news = [{'userid':'-1'}];
        fs.readFile('public/data/countries.json', function(err, data) { 
			var jsonData = data;
			var jsonParsed = JSON.parse(jsonData);
		res.render('users/adduser', {title:"Add User", data: news,role:role_name,family:news,session:req.session,country:jsonParsed.countries});
		});
	});
    }
})
// FOR FORM UPDATE AND ADD
.post(upload.single('photo'),isAuthenticated,function (req, res){
    var id = req.body.id;
	 var msg;
	  var img = req.body.photo;
	if(id){
		 
		var myquery ={"_id": ObjectId(id)}; 
		var dbo = db.get();
		if(req.file != undefined){
			var photo=req.file.filename;
		}
		else{
			var photo=req.body.photo_old;
		}
		if(req.body.password != ''){
			var pass= md5(req.body.password);

		}
		else{
			var pass = req.body.password_old; 
		}
		var roleid = req.body.role;
		var idrole = ObjectId(roleid);
		
		var newvalues = {$set: { 
			firstname: req.body.firstname,
			middlename: req.body.middlename,
			lastname: req.body.lastname,
			email:req.body.email,
			photo:photo,
			ccode:req.body.ccode,
			mobile:req.body.mobile,
			occupation:req.body.occupation,
			birthdate: req.body.birthdate,
			gender: req.body.gender,
			username: req.body.username,
			role:idrole,
			password: pass,
			address:req.body.address,
			country:parseInt(req.body.country, 10),
			state:parseInt(req.body.state,10),
			city:parseInt(req.body.city,10),
			pincode:req.body.pincode,
			status:1,
		}};
		 dbo.collection("Users").updateOne(myquery, newvalues, function(err, result) {
			
			if (err) throw err;
				
			});		
		var data = [];
			myquery1='';
		
			for (const [key, value] of Object.entries(req.body.family)) {
				
					var myquery1 ={"_id": ObjectId(value.id)};
					var newval = {$set:{					
						familymember: value.familymember,
						relationship: value.relationship,
						famoccupation: value.famoccupation,
						famcontact: value.famcontact,
						income: value.income,
				  }};
				
				 dbo.collection("familydata").updateOne(myquery1, newval, {multi: true }, function(err, result) 
				 {
					 if (err) {
						req.flash('error','Error occured.');
						res.redirect('/users/userlist');
					 }
					 else{
						 req.flash('success','User Updated Sucessfully.');
						res.redirect('/users/userlist');
					 }
					 
				});
			}
			
		}

	else{
		var dbo = db.get();
		var pass= md5(req.body.password);
		var pass1= md5(req.body.confirmpassword);
		var roleid = req.body.role;
		var idrole = ObjectId(roleid);
		// console.log(req.body);
		var myobj = { 
			firstname: req.body.firstname,
			middlename: req.body.middlename,
			lastname: req.body.lastname,
			email:req.body.email,
			photo:req.file.filename,
			ccode:req.body.ccode,
			mobile:req.body.mobile,
			occupation:req.body.occupation,
			birthdate: req.body.birthdate,
			gender: req.body.gender,
			username: req.body.username,
			role:idrole,
			password: pass,
			address:req.body.address,
			country:parseInt(req.body.country, 10),
			state:parseInt(req.body.state,10),
			city:parseInt(req.body.city,10),
			pincode:req.body.pincode,
			status:1,
		};
			
		
		 dbo.collection("Users").insertOne(myobj, function(err, result) {
			if (err) throw err;
			dbo.collection("notificationtemplate").find({templatetitle:"Added User"}).toArray(function(err, notification) {
				var myquery2 = {"_id": idrole};
				dbo.collection("Role").find(myquery2).toArray(function(err, role) {
				
				for (const [key,value] of Object.entries(notification)) {
				var message = value.content;
				var subject = value.subject;
					var Obj = {
							'_USERFIRSTNAME_': req.body.firstname, 
							'_USERLASTNAME_': req.body.lastname, 
							'_ROLENAME_': role[0].role_nm,
							'_._': "\r\n",
						}; 
					var trans=message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_ROLENAME_|_._/gi, function(matched){ 
						return Obj[matched]; 
					});  
					console.log(trans);
				Mail.sendMail(req.body.email,subject,trans);
				};
				console.log("1 document inserted");
				var data = [];
				req.body.family.forEach(element => { 
				var this_news = { 
					user_id: result.insertedId,
					familymember: element.familymember,
					relationship: element.relationship,
					famoccupation: element.famoccupation,
					famcontact: element.famcontact,
					income: element.income,
				}
					data.push(this_news);
				});
				// console.log(data);
				dbo.collection("familydata").insertMany(data, function(err, result) {
					 if (err) {
						req.flash('error','Error occured.');
						res.redirect('/users/userlist');
					 }
					 else{
						 req.flash('success','User Instered Sucessfully.');
						 res.redirect('/users/userlist');
					 }
				});	
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