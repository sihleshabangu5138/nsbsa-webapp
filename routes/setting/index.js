const express = require('express');
const router = express.Router();
const session = require('express-session');
const flash = require('express-flash');
const generalSettings = require('../../controllers/generalsettingController');

const lang = require('../../config/languageconfig');
const viewAccessMiddleware = require("../../utils/middleware/viewRights")

const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'public/images/upload/generalsetting');
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});

router.use(lang.init);
const upload = multer({ storage: storage });
router.use(session({
  secret: '222222',
  resave: true,
  saveUninitialized: true,
}));
router.use(flash());

const isAuthenticated = viewAccessMiddleware('generalsetting');

router.route('/generalsettings/generalsetting/:id?').get(isAuthenticated, generalSettings.getGeneralSettings).post(upload.single('company_logo'), isAuthenticated, generalSettings.postGeneralSettings);

module.exports = router;