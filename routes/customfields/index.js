const express = require('express');
const router = express.Router();
const session = require('express-session');
const flash = require('express-flash');
const customfield = require('../../controllers/customFieldController');
const lang = require('../../config/languageconfig');

const viewAccessMiddleware = require("../../utils/middleware/viewRights");
const addAccessMiddleware = require("../../utils/middleware/addRights");

router.use(session({
  secret: '222222',
  resave: true,
  saveUninitialized: true,
}));

router.use(flash());
router.use(lang.init);

const isAuthenticated = viewAccessMiddleware('customfield');
const isAuthenticated2 = addAccessMiddleware('customfield');

router.get('/customfields/customfieldlist', isAuthenticated, customfield.getCustomFieldList);
router.get('/customfields/customfieldlist/delete/:id', isAuthenticated, customfield.getCustomFieldDelete);
router.route('/customfields/addcustomfields/:id?').get(isAuthenticated2, customfield.getAddCustomField).post(isAuthenticated2, customfield.postAddCustomField);

module.exports = router;