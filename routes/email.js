var express = require('express');
var app = express();
const nodemailer = require('nodemailer');
 

function sendMail(to,subject,message) 
{
   var smtpConfig = {
      // service: 'Gmail',
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,
    auth: {
       user: 'cakephp.projects@gmail.com',
       pass: '99Inchrod'
    },
   };
   var transporter = nodemailer.createTransport(smtpConfig);
   var mailOptions = {
      from: '"EWS" <sender@gmail.com>', // sender address
      to: to, // list of receivers
	  headers:{ 'X-MC-AutoHtml':"true"},
      subject: subject, // Subject line
      text: 'Hello world ?', // plaintext body
      html: message // html body
   };
   
   transporter.sendMail(mailOptions, function(error, info){
      if(error)
      {
         return console.log(error);
      }
      else
      {
         return console.log(info.response);
      }      
   }); 
}


module.exports = { 
sendMail
};