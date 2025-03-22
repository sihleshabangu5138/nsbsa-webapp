'use strict';
const express = require('express');
const app = express();
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
// Load environment variables from .env file
dotenv.config();

async function sendMail(to, subject, message) {
  const mailtrapUser = process.env.MAIL_USER;
  const mailtrapPass = process.env.MAIL_PASS;

  // Check if mailtrapUser and mailtrapPass are not empty
  if (mailtrapUser && mailtrapPass) {
    var transporter = nodemailer.createTransport({
      host:"smtp.gmail.com",// host: "smtp.mailtrap.io",
      port: 587,// port: 2525,
      auth: {
        user: mailtrapUser,
        pass: mailtrapPass
      },
    });

    const mailOptions = {
      from: '"EWS" <sender@gmail.com>', // sender address
      to: to, // list of receivers
      headers: {
        'X-MC-AutoHtml': "true"
      },
      subject: subject, // Subject line
      text: 'Hello world ?', // plaintext body
      html: message // html body
    };

    try {
      const info = await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error(error);
    }
  } else {
    console.log('MAIL_USER or MAIL_PASS is empty. Skipping email sending.');
  }
}

module.exports = {
  sendMail
};
