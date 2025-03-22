const express = require('express');
const router = express.Router();
const session = require('express-session');
const flash = require('express-flash');
const lang = require('../../config/languageconfig');
const Loan = require('../../controllers/loanController');

router.use(session({
  secret: '222222',
  resave: true,
  saveUninitialized: true,
}));
router.use(lang.init);

router.use(flash());
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'public/images/upload');
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});
const upload = multer({ storage: storage });

const viewAccessMiddleware = require('../../utils/middleware/viewRights');
const addAccessMiddleware = require('../../utils/middleware/addRights');

const isAuthenticated1 = viewAccessMiddleware('typeofloan');
const isAuthenticated2 = addAccessMiddleware('typeofloan');

router.get('/loan/loantypelist', isAuthenticated1, Loan.getLoanTypeList);
router.route('/loan/addloantype/:id?').get(isAuthenticated2, Loan.getAddLoanType).post(upload.any(), isAuthenticated2, Loan.postAddLoanType);

module.exports = router;