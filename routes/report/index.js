const express = require('express');
const router = express.Router();
const session = require('express-session');
const flash = require('express-flash');
const lang = require('../../config/languageconfig');

const reportController = require('../../controllers/reportController');
const viewAccessMiddleware = require('../../utils/middleware/viewRights');

router.use(lang.init);
router.use(
  session({
    secret: '222222',
    resave: false,
    saveUninitialized: true,
  })
);
router.use(flash());

const isAuthenticated = viewAccessMiddleware('report');

router.get('/report/report', isAuthenticated, reportController.getReport);

module.exports = router;