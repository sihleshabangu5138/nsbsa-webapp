const express = require('express');
const router = express.Router();
const Installation = require('../../controllers/installationController');
const mongoose = require('mongoose');
const fs = require('fs');
const session = require('express-session');
const flash = require('express-flash');
const lang = require('../../config/languageconfig');
const Setting = require('../../models/Settings');
const { connectToDatabase } = require('../../config/config');

router.use(session({
  secret: '222222',
  resave: true,
  saveUninitialized: true,
}));
router.use(flash());
router.use(lang.init);



async function checkAndDeleteDatabase(req, res, next) {
  const { DB_USERNAME, DB_PASSWORD, DB_HOST, DB_DATABASE } = process.env;
  console.log("CRED :", DB_USERNAME, DB_PASSWORD, DB_HOST, DB_DATABASE);

  if (DB_USERNAME && DB_PASSWORD && DB_HOST && DB_DATABASE) {
    try {
      connectToDatabase();
      // Check if Installation collection has dbConnect: true and installation: false
      const installationRecord = await Setting.findOne({
        dbConnect: 'true',
        installation: 'false',
      });
      if (installationRecord) {
        // Delete the database or perform necessary actions
        // Add your logic for deleting the database here
        await mongoose.connection.db.dropDatabase();
        fs.writeFileSync('.env', '');
        console.log('Database deleted successfully');
        // After deleting the database, redirect to the installation page
        res.render('installation', { title: 'NSBSA', layout: 'loginlayout' });
      } else {
        // Continue to the next middleware if conditions are not met
        res.redirect('/');
      }
    } catch (error) {
      console.error('Error checking or deleting the database:', error);
      // Handle error, e.g., redirect to an error page
      return res.render('error', { title: 'Error', layout: 'errorlayout' });
    }
  } else {
    // .env file does not have complete data, redirect to the installation page
    console.log('redirect to installation because of empty env');
    return res.render('installation', { title: 'NSBSA', layout: 'loginlayout' });
  }
}



router.get('/installation', checkAndDeleteDatabase, Installation.getIns);
router.post('/installation', Installation.postIns);

module.exports = router;