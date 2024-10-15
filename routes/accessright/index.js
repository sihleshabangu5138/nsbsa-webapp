const express = require('express');
const router = express.Router();
const session = require('express-session');
const flash = require('express-flash');
const multer = require('multer');
const lang = require('../../config/languageconfig');
const viewAccessMiddleware = require("../../utils/middleware/viewRights")

const passarray = multer();

router.use(express.urlencoded({ extended: false }));
router.use(
  session({ secret: '222222', resave: true, saveUninitialized: true })
);
router.use(lang.init);
router.use(flash());

const accessrightController = require('../../controllers/accessRightsController');

const isAuthenticated = viewAccessMiddleware('access');

router.route('/accessrights/accessright/:id?').get(isAuthenticated, accessrightController.getAccessRight).post(passarray.array(), isAuthenticated, accessrightController.postAccessRight);

module.exports = router;