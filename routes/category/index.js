const express = require('express');
const router = express.Router();
const session = require('express-session');
const flash = require('express-flash');
const lang = require('../../config/languageconfig');
const viewAccessMiddleware = require("../../utils/middleware/viewRights");
const addAccessMiddleware = require("../../utils/middleware/addRights");

const categoryController = require('../../controllers/categoryController');

router.use(session({
  secret: '222222',
  resave: true,
  saveUninitialized: true,
}));

// Add connect-flash middleware
router.use(flash());
router.use(lang.init);

const isAuthenticated = viewAccessMiddleware('category');
const isAuthenticated2 = addAccessMiddleware('category');

router.get('/category/categorylist', isAuthenticated, categoryController.getCategoryList);
router.route('/category/addcategory/:id?').get(isAuthenticated2, categoryController.getAddCategory).post(isAuthenticated, categoryController.postAddCategory);

module.exports = router;