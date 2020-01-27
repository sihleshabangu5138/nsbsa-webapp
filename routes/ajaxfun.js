var express = require('express');
var router = express.Router();
var db = require('./mongo_db');
var ObjectId = require('mongodb').ObjectId;
var fs = require('fs');
var Mail = require('./email');
 

/* GET users listing. */
router.get('/',isAuthenticated, function(req, res, next) {
	// var dbo = db.get();
	
	var dbo = db.get("BankingSystem");
	var query ={status : 1};
	
	dbo.collection("Users").find(query).toArray(function(err, result) {
		if (err) throw err;
		// res.setHeader('Content-Type', 'application/json');
		
		res.json(result);
		//res.json({ data: result });
	});
  });
 
router.get('/deactivateuser',isAuthenticated, function(req, res, next) {
	// var dbo = db.get();
	
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
router.get('/roles', isAuthenticated,function(req, res) { 
	var dbo = db.get("BankingSystem");
	dbo.collection("Role").find({}).toArray(function(err, result) {
		if (err) throw err;
		
		res.json(result);
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
           
        } 
		else{
			res.json("done");
		}
		 								
	}); 
});
 
router.get('/roles/delete', isAuthenticated,function(req, res) { 
	var dbo = db.get("BankingSystem");
	var id = req.query._id;
	
	var myquery = { _id: id };
	dbo.collection("Role").remove({_id: new ObjectId(id)}, function(err, result){
        if (err) {
           
        } 
		else{
			res.json("done");
		}
		 								
	}); 
});
router.get('/reminder/delete', isAuthenticated,function(req, res) { 
	var dbo = db.get("BankingSystem");
	var id = req.query._id;
	
	var myquery = { _id: id };
	dbo.collection("Reminder").remove({_id: new ObjectId(id)}, function(err, result){
        if (err) {
           
        } 
		else{
			res.json("done");
		}	 								
	}); 
});

router.get('/loanlist', isAuthenticated,function(req, res) {

// console.log("ffffffffff");
	var dbo = db.get("BankingSystem");
	var query = { $and: [ {status : 1 },{approvestatus : 1 }] };
	dbo.collection("loan_details").find(query).toArray(function(err, result) {
		if (err) throw err;
		res.json(result);
});
});

router.get('/disapproveloan', isAuthenticated,function(req, res) { 
// console.log("ffffffffff");
	var dbo = db.get("BankingSystem");
	var query = { $and: [ {status : 1 },{approvestatus : 0 }] };
	dbo.collection("loan_details").find(query).toArray(function(err, result) {
		if (err) throw err;
		res.json(result);
});
});

router.get('/loanlist/delete', isAuthenticated,function(req, res) { 
// console.log("ffffffffff");
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
console.log("ffffffffff");
	var dbo = db.get("BankingSystem");
	var id = req.query.loanid;
	var myquery ={"_id": ObjectId(id)}; 
	dbo.collection("loantype").find(myquery).toArray(function(err, result) {
		if (err) throw err;
		// console.log(result);
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
			console.log(" document(s) updated");
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
				console.log("1 document inserted");
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
		console.log(name1);
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
		console.log(newvalues);
		}
		dbo.collection("loan_details").updateOne(myquery, newvalues, function(err, res) {
			if (err) throw err;
			// console.log(" document(s) updated");
		});
	}
})
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
