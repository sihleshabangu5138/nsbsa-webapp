const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
const lang = require('../../config/languageconfig');
const fs = require('fs');
const dotenv = require('dotenv');
const Login = require('../../controllers/loginController');
const Setting = require("../../models/Settings");
const { connectToDatabase } = require("../../config/config");
const { verifyLoginPurchaseKey } = require('../../utils/middleware/verifyLoginKey');
const path = require('path');

dotenv.config();

router.use(lang.init);
router.use(cookieParser());
router.use(
  session({
    secret: '343ji43j4n3jn4jk3n', cookie: { maxAge: 3600000 }, resave: true,
    saveUninitialized: true,
  })
);

router.use(flash());
function reloadEnv() {
  const envFilePath = path.resolve(process.cwd(), '.env'); // Get the .env file path
  
  // Check if .env file exists
  if (!fs.existsSync(envFilePath)) {
    console.error('.env file not found at:', envFilePath);
    return;
  }
  const envContent = fs.readFileSync('.env', 'utf8');
  const envLines = envContent.split('\n');

  envLines.forEach(line => {
    if (line.includes('=')) {
      const [key, value] = line.split('=');
      process.env[key.trim()] = value.trim();
    }
  });
}

async function isconnected(req, res, next) {
  reloadEnv();
  const {
    DB_USERNAME,
    DB_PASSWORD,
    DB_HOST,
    DB_DATABASE
  } = process.env;
  console.log("CRED :", DB_USERNAME, DB_PASSWORD, DB_HOST, DB_DATABASE);
  if (!DB_USERNAME || !DB_PASSWORD || !DB_HOST || !DB_DATABASE) {
    console.log('redirect to installation');
    fs.writeFileSync('.env', '');
    return res.render('installation', { title: 'NiftyEWS', layout: 'loginlayout' });
  }
  else {
    return next();
  }
}

async function isinstalled(req, res, next) {
  if (mongoose.connection.readyState === 0) {
    // If the connection is not open, establish a new one
    connectToDatabase();
    console.log('Connected to the database with stored credentials');
  }  // Check if DATABASE_CONNECTION is set to true in .env
  const installationRecord = await Setting.findOne({});
  console.log(installationRecord);
  if (installationRecord && installationRecord.installation === 'true') {
    console.log('Installation completed is true');
    // Proceed to the next middleware
    return next();
  } else {
    // Render installation view if DATABASE_CONNECTION is not true
    // return res.redirect('/installation?currentStep=2');
    await mongoose.connection.db.dropDatabase();
    fs.writeFileSync('.env', '');
    console.log('Database deleted successfully');
    res.render('installation', { title: 'NiftyEWS', layout: 'loginlayout', currentStep: 2 });
  }
}

async function isCheck(req, res, next) {
    await verifyLoginPurchaseKey(req, res,next);
}

function isAuthenticated(req, res, next) {
  if (req.session.username !== undefined) {
    return next();
  } else {
    res.render('login', { title: 'NiftyEWS', layout: 'loginlayout' });
  }
}

router.get('/',isconnected,isinstalled,isCheck,isAuthenticated, Login.getLogin);
router.post('/',Login.postLogin);
router.get('/logout', isAuthenticated, Login.getLogout);

module.exports = router;