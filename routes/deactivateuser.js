var express = require('express');
var router = express.Router();
var db = require('./mongo_db');
var ObjectId = require('mongodb').ObjectId;
var Mail = require('./email');
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');
  
router.use(cookieParser());
router.use(session({ secret: '222222'}))
router.use(flash());

/* GET users listing. */
router.get('/',isAuthenticated, function(req, res, next) {
	var dbo = db.get("BankingSystem");
		 dbo.collection("Users").count({}, function(error, numOfDocs){
            if(error) return callback(error);
				
		var query = {status : 1};
		dbo.collection("Users").count((query), function(error, activeuser){
            if(error) return callback(error);
				
		var query = {status : 0};
        dbo.collection("Users").count((query), function(error, deactiveuser){
            if(error) return callback(error);
            
		var path=__basedir+"/public/images/upload/";
		var path1=__basedir;
		res.render('users/deactivateuser', { title: 'Deactivate Users' , path : path, path1:path1,count:numOfDocs,activecount:activeuser,deactivecount:deactiveuser,session:req.session,messages:req.flash()});
});
});
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
router.get('/delete/:id',isAuthenticated, function(req, res) { 
	var dbo = db.get("BankingSystem");
    var id = req.params.id;
	var myquery = { _id: id };
	dbo.collection("Users").remove({_id: new ObjectId(id)}, function(err, result){
        if (err) {
           
        } 
	
	});
	res.redirect('/users/userlist');
});

function isAuthenticated(req, res, next) {
	
	if (req.session.username != undefined) {
		 return next();
	} else {
		res.redirect('/');	
	}
	
};

module.exports = router;
