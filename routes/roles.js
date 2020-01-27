var express = require('express');
var router = express.Router();
var db = require('./mongo_db');
var ObjectId = require('mongodb').ObjectId;
var lang = require('./languageconfig'); 
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');

router.use(lang.init);
router.use(cookieParser());
router.use(session({ secret: '222222'}))
router.use(flash());


/* GET users listing. */
router.get('/', isAuthenticated,function(req, res, next) {
	var path=__basedir+"/public/images/upload/";
		// console.log(req.flash());
	res.render('role/roles', { title: 'Roles',session:req.session,messages:req.flash()});
 
});

router.get('/delete/:id',isAuthenticated, function(req, res) { 
	var dbo = db.get("BankingSystem");
	var id = req.params.id;

	var myquery = { _id: id };
	dbo.collection("Role").remove({_id: new ObjectId(id)}, function(err, result){
       if (err) {
           // console.log(err);
				} 
		else {
			res.redirect('/role/rolelist');
			}
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
