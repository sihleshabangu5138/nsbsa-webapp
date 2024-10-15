const express = require('express');
const router = express.Router();
const session = require('express-session');
const flash = require('express-flash');
const ActivityLogController = require('../../controllers/activitylogController');
const lang = require('../../config/languageconfig');
const viewAccessMiddleware = require("../../utils/middleware/viewRights")

router.use(lang.init)
router.use(session({
  secret: '222222',
  resave: true,
  saveUninitialized: true,
}));

router.use(flash());

const isAuthenticated = viewAccessMiddleware('activitylog');

router.get('/activitylog/activitylog', isAuthenticated, ActivityLogController.getActivitylog);

module.exports = router;