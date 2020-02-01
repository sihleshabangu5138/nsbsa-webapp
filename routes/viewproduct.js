var express = require('express');
var router = express.Router();
var http = require('http');
var db = require('./mongo_db');
var ObjectId = require('mongodb').ObjectId;
var bodyParser = require('body-parser');
var fs = require('fs');
var lang = require('./languageconfig');
router.use(lang.init);

/* GET users listing. */
router.route('/:id?')
.get(isAuthenticated,function (req, res) {
	var dbo = db.get();
	var id = req.params.id;
	if (id){	
		var myquery ={"_id": ObjectId(id)}; 
		dbo.collection("product").find(myquery).toArray(function(err, product) {
			res.render('product/viewproduct', {title:"View Product",data:product, id:id,session:req.session,});
	});
	}
	else{
        var news = [{'userid':'-1'}];
        res.render('product/viewproduct', {title:"View Product", data: news,family:news,session:req.session});
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
