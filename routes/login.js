var express = require('express');
var router = express.Router();
var db = require('./mongo_db');
var ObjectId = require('mongodb').ObjectId;
var md5 = require('md5');
var app = express();
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('express-flash');
var lang = require('./languageconfig');  

  
router.use(lang.init);
router.use(cookieParser());
router.use(session({ secret: '343ji43j4n3jn4jk3n', cookie: { maxAge: 60000000 }}))
router.use(flash());
 

// Access the session as req.session
/* GET users listing. */
router.get('/',isAuthenticated, function(req, res, next) {
	var languages = lang.getLocale();
	// var dbo = db.get("BankingSystem");
	// dbo.collection("Generalsetting").find().toArray(function(err, result) {
			// console.log(result[0].language);
			// console.log("5555555555555555555555555555555555555");
			 // res.cookie('yourcookiename', result[0].language, { maxAge: 90000000, httpOnly: true });
		// });

	if (req.session.username != undefined) {
		 res.redirect('/dashboard');
	} else {
		res.render('login', { title: 'NiftyEWS',layout:"loginlayout",session:req.session,message:req.flash(),setlang:languages});	
	}
});
router.post('/',function(req, res) {
	var xyz=db.get("BankingSystem");
		xyz.collection("Generalsetting").find().toArray(function(err, result) {
			//console.log("4444444444444444444444444444444444");
			//console.log(result[0].language);
			//res.cookie('yourcookiename', result[0].language, { maxAge: 90000000, httpOnly: true });
			res.cookie('locale', result[0].language, { maxAge: 90000000, httpOnly: true });
		});
	var myquery ={"username": req.body.username }; 
	var name = req.body.username;
	var frompass =md5(req.body.password);
	
	xyz.collection("Users").find(myquery).toArray(function(err, result) {
		if (err) throw err;
		else{
			//console.log(result.length);
			if(result.length > 0){
				  roleaccess(result[0].role, function(access){
			 console.log(access);
				if(access == 1){ 
					if(frompass == result[0].password && name == result[0].username){
						console.log('correct');
						req.session.email=result[0].email;
						req.session.username=result[0].username;
						req.session.photo=result[0].photo;
						req.session.user_id=result[0]._id;		
						req.session.role=result[0].role;		
						// console.log(result[0]._id);
						var myquery1 ={"id": req.body._id };
						xyz.collection("Generalsetting").find(myquery1).toArray(function(err, result1) {
						if (err) throw err;
							else{
								var language= result1[0].language;
								res.cookie('locale', 'fr', { maxAge: 900000, httpOnly: true }); 
	
								req.session.gen_id=result1[0]._id;			
								req.session.company_logo=result1[0].company_logo;		
								req.session.generaldata=result1[0];		
							}
							res.redirect('/dashboard');
						});
					}
					else{
						console.log("Wrong");
						req.flash('Error','Invalid username or password.');
						res.render('login', { title: 'NiftyEWS',layout:"loginlayout"});	
					}
				 }
				 else{
					console.log("You are not allow to login.");
					req.flash('error','You are not allow to login.');
					res.render('login', { title: 'NiftyEWS',layout:"loginlayout"});
				} 
				 }); 
			}
			else{
				console.log("Wrong Username");
				req.flash('error','Invalid username or password.');
				res.render('login', { title: 'NiftyEWS',layout:"loginlayout"});	
			}
		}
	});
	/*for Generalsetting id*/
});

router.get('/logout', isAuthenticated,function(req, res) {
	console.log(req.session);
	req.session.destroy(function(err) {
		res.clearCookie('locale');
    res.redirect('/');	
  })
});

function isAuthenticated(req, res, next) {
	if (req.session.username != undefined) {
		 return next();
	}
	else{
		res.render('login', { title: 'NiftyEWS',layout:"loginlayout"});	
	}
};

function roleaccess(role,callback) {
	var xyz = db.get();
	
		var myquery ={"_id": ObjectId(role)}; 
		var xyz=db.get();
		xyz.collection("Role").find(myquery).toArray(function(err, result) {
			if(result.length > 0){
				console.log(result[0].allow_access);
				if(1 == result[0].allow_access){
					return callback(1);
				}
				else{
					return callback(0);
				}				
			}
		
		});
		
};

module.exports = router;