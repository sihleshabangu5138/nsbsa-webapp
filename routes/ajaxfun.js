var express = require('express');
var router = express.Router();
var db = require('./mongo_db');
var ObjectId = require('mongodb').ObjectId;
var fs = require('fs');
var Mail = require('./email');  
var functions = require('../helpers/function');
var moment = require('moment');
 

/* GET users listing. */
router.get('/',isAuthenticated, function(req, res, next) {
	var dbo = db.get("BankingSystem");
	var query ={status : 1};

	/*dbo.collection("Users").find(query).toArray(function(err, result) {
		if (err) throw err;

		for (const [key,value] of Object.entries(result)) {
			var birthdate_f=functions.getdate(value.birthdate,req.session.generaldata.date_format);
			result[key].birthdate = birthdate_f;
			
		}
		//console.log(result);
		res.json(result);
	});*/
	
	dbo.collection("Users").aggregate([
		{
			$lookup:{
				from : 'Role',
				localField : 'role',
				foreignField : '_id',
				as : 'role_nm'
			}
		},
		{
			$unwind : '$role_nm'
		}
	]).toArray(function(err,result){
		if(err) throw err;
		
		for (const [key,value] of Object.entries(result)) {
			var birthdate_f=functions.getdate(value.birthdate,req.session.generaldata.date_format);
			result[key].birthdate = birthdate_f;
			
		}
		//console.log(result);
		res.json(result);
	})
});

router.get('/deactivateuser',isAuthenticated, function(req, res, next) {
	var dbo = db.get("BankingSystem");
	var query ={status : 0};
	
	dbo.collection("Users").find(query).toArray(function(err, result) {
		if (err) throw err;
		// res.setHeader('Content-Type', 'application/json');
		
		res.json(result);
		//res.json({ data: result });
	});
  });  
router.get('/delete/',isAuthenticated, function(req, res) { 
	 var dbo = db.get("BankingSystem");
    var id = req.query._id;
	var myquery ={"_id": ObjectId(id)}; 
	
	var newvalues = {$set: { 
			status: 0, 
			}
		}

	dbo.collection("Users").updateOne(myquery, newvalues, function(err, result) {
		var date = Date(Date.now());
		var formatdate = moment(date).format("YYYY-MM-DD");
		dbo.collection("Users").find(myquery).toArray(function(err, useresult) {
			dbo.collection("notificationtemplate").find({templatetitle:"user deleted"}).toArray(function(err, notification) {
			for (const [key,value] of Object.entries(notification)){
			for (const [key1,value1] of Object.entries(useresult)){
				var message = value.content;
				var subject = value.subject;
				var Obj = {
					'_USERFIRSTNAME_': value1.firstname,
					'_USERLASTNAME_': value1.lastname,
					'_DATETIME_' : formatdate,
					'_newline_': '<br>',
					'_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
					'_systemname_':req.session.generaldata.com_name,
					};
				var trans=message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_DATETIME_|_newline_|_tab_|_systemname_/gi, function(matched){
					return Obj[matched]; 
				});
				var subtrans=subject.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_DATETIME_|_newline_|_tab_|_systemname_/gi, function(matched){
					return Obj[matched]; 
				});
				Mail.sendMail(value1.email,subtrans,trans);
				};
				};
			});
		});
        if (err) {
           res.json(false);
        } 
		else{
			res.json(true);
		}
		}); 
	
	//res.redirect('/userlist');
});
router.get('/deleteloan/',isAuthenticated, function(req, res) { 
	var dbo = db.get("BankingSystem");
    var id = req.query._id;
	var myquery ={"_id": ObjectId(id)};
	var newvalues = {$set:{
				status: 0,
			}
		}
	dbo.collection("loan_details").updateOne(myquery, newvalues, function(err, result){
        if (err) {
           res.json(false);
        }
		else{
			res.json(true);
		}
	});
});
router.get('/deletenoti',isAuthenticated, function(req, res) { 	
	var dbo = db.get("BankingSystem");
	dbo.collection("notification_badges").remove({});
});
router.get('/roles', isAuthenticated,function(req, res) {
	
	var dbo = db.get("BankingSystem");
	var query = {status:0}
	dbo.collection("Role").find(query).toArray(function(err, result) {
		if (err) throw err;
		res.json(result);
});
});
router.get('/customfields', isAuthenticated,function(req, res) { 
	var dbo = db.get("BankingSystem");
	dbo.collection("customfields").find({}).toArray(function(err, result) {
		if (err) throw err;
		for (const [key,value] of Object.entries(result)) {
			result[key].valids=(value.validation).toString();
		};
		res.json(result);
});
});

router.get('/category', isAuthenticated,function(req, res) { 
	var dbo = db.get("BankingSystem");
	dbo.collection("category").find({}).toArray(function(err, result) {
		if (err) throw err;
		res.json(result);
});
});

router.get('/service', isAuthenticated,function(req, res) { 
	var dbo = db.get("BankingSystem");
	dbo.collection("service").find({}).toArray(function(err, result) {
		if (err) throw err;
		res.json(result);
});
});

router.get('/product', isAuthenticated,function(req, res) { 
	var dbo = db.get("BankingSystem");
	dbo.collection("product").find({}).toArray(function(err, result) {
		if (err) throw err;
		res.json(result);
});
});

router.get('/events', isAuthenticated,function(req, res) { 
	var dbo = db.get("BankingSystem");
	dbo.collection("events").find({}).toArray(function(err, result) {
		if (err) throw err;
		res.json(result);
});
});

router.post('/addcategorytype', isAuthenticated, function(req, res) {
	var dbo = db.get("BankingSystem");
	var data = {category_type:req.body.cat_type};
	dbo.collection("categorytypes").insertOne(data, function(err, result) {
		if (err) throw err;
	});
});

router.get('/reminder', isAuthenticated,function(req, res) { 
	var dbo = db.get("BankingSystem");
	dbo.collection("Reminder").find({}).toArray(function(err, result) {
		if (err) throw err;
		
		res.json(result);
});
});
router.get('/loantypelist', isAuthenticated,function(req, res) { 
	var dbo = db.get("BankingSystem");
	dbo.collection("loantype").find({}).toArray(function(err, result) {
		if (err) throw err;
		
		res.json(result);
});
});

router.get('/rules', isAuthenticated,function(req, res) { 
	var dbo = db.get("BankingSystem");
	dbo.collection("Rule").find({}).toArray(function(err, result) {
		if (err) throw err;
		
		res.json(result);
});
});

router.get('/notes', isAuthenticated,function(req, res) { 
	var dbo = db.get("BankingSystem");
	dbo.collection("notes").find({}).toArray(function(err, result) {
		if (err) throw err;
		
		res.json(result);
});
});

router.get('/notificationtemplate', isAuthenticated,function(req, res) { 
	var dbo = db.get("BankingSystem");
	dbo.collection("notificationtemplate").find({}).toArray(function(err, result) {
		if (err) throw err;
		res.json(result);
});
});

router.get('/rules/delete', isAuthenticated,function(req, res) { 
	var dbo = db.get("BankingSystem");
	var id = req.query._id;
	
	var myquery = { _id: id };
	dbo.collection("Rule").remove({_id: new ObjectId(id)}, function(err, result){
	if (err) {
           res.json(false);
        } 
		else{
			res.json(true);
		}
		 								
	}); 
});
router.get('/events/delete', isAuthenticated,function(req, res) { 
	var dbo = db.get("BankingSystem");
	var id = req.query._id;
	var myquery = { "_id":ObjectId(id) };
		dbo.collection("events").find(myquery).toArray(function(err, eventresult) {
			if(eventresult[0].eventfor == "all"){
				var queries = {"status":1};
				dbo.collection("Users").find(queries).toArray(function(err, useresult) {
				if(eventresult[0].duration == "one day"){
					dbo.collection("notificationtemplate").find({templatetitle:"one day event deleted"}).toArray(function(err, notification) {
					for (const [key,value] of Object.entries(notification)){
					for (const [key1,value1] of Object.entries(useresult)){
						var message = value.content;
						var subject = value.subject;
						var Obj = {
								'_USERFIRSTNAME_': value1.firstname, 
								'_USERLASTNAME_': value1.lastname, 
								'_EVENTDURATION_': eventresult[0].duration, 
								'_EVENTSTARTDATE_': eventresult[0].startdate,
								'_EVENTNAME_': eventresult[0].eventtitle, 
								'_EVENTVENUE_': eventresult[0].eventvenue,  
								'_newline_': '<br>',
								'_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
								'_systemname_':req.session.generaldata.com_name,
							};
						var trans=message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_newline_|_tab_|_systemname_/gi, function(matched){
							return Obj[matched]; 
						});
						var subtrans=subject.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_newline_|_tab_|_systemname_/gi, function(matched){
							return Obj[matched]; 
						});
						Mail.sendMail(value1.email,subtrans,trans);
						};
						};
					});
				}
				else{
					dbo.collection("notificationtemplate").find({templatetitle:"multiple day event deleted"}).toArray(function(err, notification) {
					for (const [key,value] of Object.entries(notification)){
					for (const [key1,value1] of Object.entries(useresult)){
						var message = value.content;
						var subject = value.subject;
						var Obj = {
								'_USERFIRSTNAME_': value1.firstname, 
								'_USERLASTNAME_': value1.lastname, 
								'_EVENTDURATION_': eventresult[0].duration, 
								'_EVENTSTARTDATE_': eventresult[0].startdate, 
								'_EVENTENDDATE_': eventresult[0].enddate, 
								'_EVENTNAME_': eventresult[0].eventtitle, 
								'_EVENTVENUE_': eventresult[0].eventvenue,  
								'_newline_': '<br>',
								'_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
								'_systemname_':req.session.generaldata.com_name,
							};
						var trans=message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function(matched){
							return Obj[matched]; 
						});
						var subtrans=subject.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function(matched){
							return Obj[matched]; 
						});
						Mail.sendMail(value1.email,subtrans,trans);
						};
						};
				});
			}
			});
			}
			else{
				var mailquery = { $and: [ {"role":ObjectId(eventresult[0].eventfor)} , {"status":1} ] };
				dbo.collection("Users").find(mailquery).toArray(function(err, useresult) {		
				if(req.body.duration == "one day"){
					dbo.collection("notificationtemplate").find({templatetitle:"one day event deleted"}).toArray(function(err, notification) {
					for (const [key,value] of Object.entries(notification)){
					for (const [key1,value1] of Object.entries(useresult)){
						var message = value.content;
						var subject = value.subject;
						var Obj = {
								'_USERFIRSTNAME_': value1.firstname, 
								'_USERLASTNAME_': value1.lastname, 
								'_EVENTDURATION_': eventresult[0].duration, 
								'_EVENTSTARTDATE_': eventresult[0].startdate, 
								'_EVENTENDDATE_': eventresult[0].enddate, 
								'_EVENTNAME_': eventresult[0].eventtitle, 
								'_EVENTVENUE_': eventresult[0].eventvenue,  
								'_newline_': '<br>',
								'_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
								'_systemname_':req.session.generaldata.com_name,
							};
						var trans=message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function(matched){
							return Obj[matched]; 
						});
						var subtrans=subject.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function(matched){
							return Obj[matched]; 
						});
						Mail.sendMail(value1.email,subtrans,trans);
						};
						};
					});
				}			
				else{
				dbo.collection("notificationtemplate").find({templatetitle:"multiple day event deleted"}).toArray(function(err, notification) {
				for (const [key,value] of Object.entries(notification)){
				for (const [key1,value1] of Object.entries(useresult)){
					var message = value.content;
					var subject = value.subject;
					var Obj = {
							'_USERFIRSTNAME_': value1.firstname, 
							'_USERLASTNAME_': value1.lastname, 
							'_EVENTDURATION_': eventresult[0].duration, 
							'_EVENTSTARTDATE_': eventresult[0].startdate, 
							'_EVENTENDDATE_': eventresult[0].enddate, 
							'_EVENTNAME_': eventresult[0].eventtitle, 
							'_EVENTVENUE_': eventresult[0].eventvenue,  
							'_newline_': '<br>',
							'_tab_': '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
							'_systemname_':req.session.generaldata.com_name,
							};
						var trans=message.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function(matched){
							return Obj[matched]; 
						});
						var subtrans=subject.replace(/_USERFIRSTNAME_|_USERLASTNAME_|_EVENTDURATION_|_EVENTNAME_|_EVENTSTARTDATE_|_EVENTVENUE_|_EVENTENDDATE_|_newline_|_tab_|_systemname_/gi, function(matched){
							return Obj[matched]; 
						});
					Mail.sendMail(value1.email,subtrans,trans);
					};
					};
				});	
				}	
				});	
			}
	dbo.collection("events").remove({_id: new ObjectId(id)}, function(err, result){
         if (err) {
           res.json(false);
        } 
		else{
			res.json(true);
		}
	}); 
	
});
});
router.get('/customfield/delete', isAuthenticated,function(req, res) { 
	var dbo = db.get("BankingSystem");
	var id = req.query._id;
	
	var myquery = { _id: id };
	dbo.collection("customfields").remove({_id: new ObjectId(id)}, function(err, result){
         if (err) {
           res.json(false);
        } 
		else{
			res.json(true);
		}
		 								
	}); 
});
router.get('/notes/delete', isAuthenticated,function(req, res) { 
	var dbo = db.get("BankingSystem");
	var id = req.query._id;
	
	var myquery = { _id: id };
	dbo.collection("notes").remove({_id: new ObjectId(id)}, function(err, result){
        if (err) {
           res.json(false);
        } 
		else{
			res.json(true);
		}
		 								
	}); 
});
router.get('/category/delete', isAuthenticated,function(req, res) { 
	var dbo = db.get("BankingSystem");
	var id = req.query._id;
	
	var myquery = { _id: id };
	dbo.collection("category").remove({_id: new ObjectId(id)}, function(err, result){
        if (err) {
           res.json(false);
        } 
		else{
			res.json(true);
		}							
	}); 
});
 
router.post('/clearlog', isAuthenticated,function(req, res) { 
	var dbo = db.get("BankingSystem");
	var date = Date(Date.now());
	var myobjs = { 
			module: "Log",
			date:formatdate,
			action: "cleared",
			user: ObjectId(req.session.user_id),
			item: "activitylog",
		};
	var formatdate = moment(date).format("YYYY-MM-DD");
	dbo.collection("activitylog").remove({});
	
			
	dbo.collection("activitylog").insertOne(myobjs , function(err, activity) {
        if (err) {    
			 res.json(false);
        } 
		else{
			res.json(true);
		}
});
});
 
router.get('/service/delete', isAuthenticated,function(req, res) { 
	var dbo = db.get("BankingSystem");
	var id = req.query._id;
	
	var myquery = { _id: id };
	dbo.collection("service").remove({_id: new ObjectId(id)}, function(err, result){
         if (err) {
           res.json(false);
        } 
		else{
			res.json(true);
		}							
	}); 
});

router.get('/product/delete', isAuthenticated,function(req, res) { 
	var dbo = db.get("BankingSystem");
	var id = req.query._id;	
	var myquery = { _id: id };
	dbo.collection("product").remove({_id: new ObjectId(id)}, function(err, result){
        if (err) {
           res.json(false);
        } 
		else{
			res.json(true);
		}							
	}); 
});
router.get('/roles/delete', isAuthenticated,function(req, res) { 
	var dbo = db.get("BankingSystem");
	var id = req.query._id;
	
	var myquery = { _id: id };
	dbo.collection("Role").remove({_id: new ObjectId(id)}, function(err, result){
         if (err) {
           res.json(false);
        } 
		else{
			res.json(true);
		}								
	}); 
});
router.get('/reminder/delete', isAuthenticated,function(req, res) { 
	var dbo = db.get("BankingSystem");
	var id = req.query._id;
	
	var myquery = { _id: id };
	dbo.collection("Reminder").remove({_id: new ObjectId(id)}, function(err, result){
        if (err) {
           res.json(false);
        } 
		else{
			res.json(true);
		} 								
	}); 
});

router.get('/loanlist', isAuthenticated,function(req, res) {
	var dbo = db.get("BankingSystem");
	var id = req.query._id;
	var query = { $and: [ {status : 1 },{approvestatus : 1 }] };
	/*dbo.collection("loan_details").find(query).toArray(function(err, result) {
		if (err) throw err;				
		res.json(result);
	});*/
	
	dbo.collection("loan_details").aggregate([
		{
			$lookup:{
				from: "loantype",
				localField: "loantype", 
				foreignField: "_id", 
				as: "loan" 
			}
		},
		{ 
			$unwind: "$loan" 
		},
		{
			$lookup:{
				from: "Users", 
				localField: "user", 
				foreignField: "_id", 
				as: "user" 
			}
		},
		{ 
			$unwind: "$user" 
		},
		{
			$match:{
				$and: [ {status : 1 },{approvestatus : 1 }]
			}
		}
	]).toArray(function(err, result) {
		if (err) throw err;
		
		res.json(result);
	});
});

router.get('/disapproveloan', isAuthenticated,function(req, res) {
	var dbo = db.get("BankingSystem");
	var query = { $and: [ {status : 1 },{approvestatus : 0 }] };
	/*dbo.collection("loan_details").find(query).toArray(function(err, result) {
		if (err) throw err;
		res.json(result);  
	});*/
	
	dbo.collection("loan_details").aggregate([
		{
			$lookup:{
				from: "loantype",
				localField: "loantype", 
				foreignField: "_id", 
				as: "loan" 
			}
		},
		{ 
			$unwind: "$loan" 
		},
		{
			$lookup:{
				from: "Users", 
				localField: "user", 
				foreignField: "_id", 
				as: "user" 
			}
		},
		{ 
			$unwind: "$user" 
		},
		{
			$match:{
				$and: [ {status : 1 },{approvestatus : 0 }]
			}
		}
	]).toArray(function(err, result) {
		if (err) throw err;
		
		res.json(result);
	});
});

router.get('/loanlist/delete', isAuthenticated,function(req, res) {
	var dbo = db.get("BankingSystem");
	var id = req.query._id;
	
	var myquery = { _id: id };
	dbo.collection("loan_details").remove({_id: new ObjectId(id)}, function(err, result){
        if (err) {
           res.json(false);
        } 
		else{
			res.json(true);
		}
		 								
	}); 
});
router.get('/loantypedesc', isAuthenticated,function(req, res) {
	var dbo = db.get("BankingSystem");
	var id = req.query.loanid;
	var myquery ={"_id": ObjectId(id)}; 
	dbo.collection("loantype").find(myquery).toArray(function(err, result) {
		if (err) throw err;
		res.json({loantype:result});
});
});
router.get('/username', isAuthenticated,function(req, res) {
	var dbo = db.get("BankingSystem");
	var user = req.query.username;
	var myquery ={"username": user}; 
	dbo.collection("Users").find(myquery).toArray(function(err, result) {
		if (err) throw err;
		res.json(result);
});
});
router.get('/duplicateemail', isAuthenticated,function(req, res) {
	var dbo = db.get("BankingSystem");
	var email = req.query.email;
	var myquery ={"email": email}; 
	dbo.collection("Users").find(myquery).toArray(function(err, result) {
		if (err) throw err;
		res.json(result);
});
});
 //role updea using juqery....
 router.post('/addrole',isAuthenticated, function (req, res){
    var id = req.body.id;
	if(id){ 
	  	var myquery ={"_id": ObjectId(id)}; 
		var dbo = db.get();
		
		var name1 =req.body.name;
		
		if(name1=='allow_access'){
			
			if('checked'==req.body.allow_access){
				var value= 1;
			}
			else{
				var value= 0;
			}
			var newvalues = {$set: { 
				allow_access:value
		}};
		}
		else{
			
			if('checked'==req.body.admin_access){
				var value= 1;
			}
			else{
				var value= 0;
			}
			
			var newvalues = {$set: { 
				admin_access:value
			}};
		}
		
		dbo.collection("Role").updateOne(myquery, newvalues, function(err, res) {
			if (err) throw err;
		});
	} 
	else {  
		
		var dbo = db.get(); 
		
		var myobj = { 
		role_nm: req.body.role_nm,
		role_slug: req.body.role_slug,
		role_desc: req.body.role_desc,
		admin_access:req.body.admin_access,
		allow_access:req.body.allow_access
		
		};
		 dbo.collection("Role").insertOne(myobj, function(err, res) {
			if (err) throw err;
			});
			res.redirect('/role/roles');
	 }
	  //res.redirect('/roles');
})
 router.post('/approveloan',isAuthenticated, function (req, res){
    var id = req.body.id;
	if(id){ 
	  	var myquery ={"_id": ObjectId(id)}; 
		var dbo = db.get();
		var name1 =req.body.name;
		if(name1=='approvestatus'){
			if('checked'==req.body.approvestatus){
				var value= 1;
				dbo.collection("loan_details").find(myquery).toArray(function(err, result) {
				var userid = result[0].user;
				var iduser = ObjectId(userid);
				var loantype = result[0].loantype;
				var typeid = ObjectId(loantype);
					dbo.collection("Users").find(iduser).toArray(function(err, result) {
						dbo.collection("notificationtemplate").find({templatetitle:"Loan Approved"}).toArray(function(err, notification) {
							dbo.collection("loantype").find(typeid).toArray(function(err, typeloan) {
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
											
										Mail.sendMail(result[0].email,subject,trans);	
									};
								 
							});
						});
					});
				}); 
			}
			else{
				var value= 0; 
			}
			var newvalues = {$set: { 
				approvestatus:value
			}}; 
		}
		dbo.collection("loan_details").updateOne(myquery, newvalues, function(err, result) {
			if (err) { 
				req.flash('error',('Error occured.'));
				res.redirect('/loan/loanlist');
			}
			 else{ 
				req.flash('success',('Loan Updated Sucessfully.'));
				res.redirect('/loan/loanlist');
				
				
			} 
		});
    }
});
router.post('/state',isAuthenticated, function (req, res){
	var id = req.body.countryId;
	
	fs.readFile('public/data/states.json', function(err, data) { 
			var jsonData = data;
			var jsonParsed = JSON.parse(jsonData);
			var states= jsonParsed.states;
			var data = [];
			for (const [key, value] of Object.entries(states)) {
				if(id == value.country_id){
					var data_push= {
						"name":value.name,
						"id":value.id,
						"country_id":value.country_id,
					}
					 data.push(data_push);
				} 
			};
	res.json({state:data});
	});
});
router.post('/city',isAuthenticated, function (req, res){
	var id = req.body.stateId;
	fs.readFile('public/data/cities.json', function(err, data) { 
			var jsonData = data;
			
			var jsonParsed = JSON.parse(jsonData);
			var cities= jsonParsed.cities;
			var data = [];
			 
			for (const [key, value] of Object.entries(cities)) {
				if(id == value.state_id){
					var data_push= {
						"name":value.name,
						"id":value.id,
						"state_id":value.state_id,
					}
					 data.push(data_push);
				} 
			};
	res.json({city:data});
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
