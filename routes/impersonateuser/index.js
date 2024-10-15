const express = require('express');
const router = express.Router();
const session = require('express-session');
const flash = require('express-flash');
const impersonateController = require('../../controllers/impersonateController');
const lang = require('../../config/languageconfig');
const viewAccessMiddleware = require('../../utils/middleware/viewRights');

router.use(session({
  secret: '222222',
  resave: true,
  saveUninitialized: true,
}));
router.use(lang.init);
router.use(flash());

const isAuthenticated = viewAccessMiddleware('impersonate');

router.route('/impersonate/impersonateuser/:id?').get(isAuthenticated, impersonateController.getImpersonate).post(isAuthenticated, impersonateController.postImpersonate);

module.exports = router;