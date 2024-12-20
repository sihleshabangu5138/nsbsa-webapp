const express = require('express');
const router = express.Router();
const session = require('express-session');
const flash = require('express-flash');
const lang = require('../../config/languageconfig');
const ruleController = require('../../controllers/ruleController');

router.use(session({
  secret: '222222',
  resave: true,
  saveUninitialized: true,
}));
router.use(flash());
router.use(lang.init);

const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'public/images/upload');
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + '-' + file.originalname.replaceAll(' ', '-'));
  },
});
const upload = multer({ storage: storage });


const viewAccessMiddleware = require('../../utils/middleware/viewRights');
const addAccessMiddleware = require('../../utils/middleware/addRights');

const isAuthenticated1 = viewAccessMiddleware('rulesandregulation');
const isAuthenticated2 = addAccessMiddleware('rulesandregulation');

router.get('/rule/rules', isAuthenticated1, ruleController.getRulesList);
router.get('/rule/rules/delete/:id', isAuthenticated1, ruleController.getRulesDelete);
router.route('/rule/addrule/:id?').get(isAuthenticated2, ruleController.getAddRule).post(upload.any(), isAuthenticated2, ruleController.postAddRule);

module.exports = router;