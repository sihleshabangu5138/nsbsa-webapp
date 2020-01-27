const mongoClient = require('mongodb').MongoClient;
const mongoDbUrl = 'mongodb://127.0.0.1:27017/BankingSystem';
let mongodb;
var express = require('express');
var app = express();
 
function connect(callback){
    mongoClient.connect(mongoDbUrl,{useNewUrlParser: true}, (err, db) => {
        mongodb = db;
		callback();
    });
}
function get(){
    return mongodb;
}

function close(){
    mongodb.close();
}
/*  mongoClient.connect(mongoDbUrl, function(err, db) {
  if (err) throw err;
  var dbo = db.db("BankingSystem");
  dbo.collection("Users").find({}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
  });
});  */


module.exports = {
    connect,
    get,
    close
};