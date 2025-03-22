const express = require('express');
const router = express.Router();
const Dashboard = require('../../controllers/dashboardController');
const session = require('express-session');
const flash = require('express-flash');
const lang = require('../../config/languageconfig');

router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(
  session({ secret: '222222', resave: true, saveUninitialized: true })
);
router.use(flash());
router.use(lang.init);

function isAuthenticated(req, res, next) {
  if (req.session.username !== undefined) {
    return next();
  } else {
    res.redirect('/');
  }
}

router.get('/dashboard', isAuthenticated, Dashboard.getDashboard);
router.get('/notification/notificationlist', Dashboard.getNotiBadge);

module.exports = router;