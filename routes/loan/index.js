const express = require('express');
const router = express.Router();
const session = require('express-session');
const flash = require('express-flash');
const cookieParser = require('cookie-parser');
const Loan = require('../../controllers/loanController');
const lang = require('../../config/languageconfig');

const multer = require('multer');
router.use(session({
  secret: '222222',
  resave: true,
  saveUninitialized: true,
}));

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'public/images/upload');
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});
const upload = multer({ storage: storage });

router.use(cookieParser());
router.use(flash());
router.use(lang.init);

const viewAccessMiddleware = require('../../utils/middleware/viewRights');
const addAccessMiddleware = require('../../utils/middleware/addRights');

function isAuthenticated2(req, res, next) {
  if (req.session.username !== undefined) {
    return next();
  } else {
    res.redirect('/');
  }
}

const isAuthenticated = viewAccessMiddleware('loanlist');
const isAuthenticated3 = addAccessMiddleware('loanlist');
const isAuthenticated4 = viewAccessMiddleware('disapproveloanlist');
const isAuthenticated5 = viewAccessMiddleware('totalloanlist');

router.get('/loan/loanlist', isAuthenticated, Loan.getLoanList);
router.get('/loan/loanlist/:id', isAuthenticated, Loan.getLoanListDelete);
router.route('/loan/viewloan/:id?').get(isAuthenticated, Loan.getViewLoan);
router.route('/loan/addemi/:id?').get(isAuthenticated2, Loan.getEmiDetails).post(upload.any(), isAuthenticated2, Loan.postEmiDetails);
router.route('/loan/repayment/:id?').get(isAuthenticated2, Loan.getRepayment).post(isAuthenticated3, Loan.postRepayment);
router.route('/loan/addloan/:id?').get(isAuthenticated3, Loan.getAddLoan).post(upload.any(), isAuthenticated3, Loan.postAddLoan);
router.get('/loan/disapproveloan', isAuthenticated4, Loan.getDisapproveLoanCountList);
router.get('/loan/disapproveloan/delete/:id', isAuthenticated4, Loan.getDisapproveLoanDelete);
router.get('/loan/totalLoans', isAuthenticated5, Loan.getTotalLoanCountList);
router.get('/loan/totalloans/totalloans', isAuthenticated5, Loan.getTotalLoanList);
router.get('/loan/totalloans/delete/:id', isAuthenticated5, Loan.getTotalLoanDelete);
router.get('/loan/loanreports', isAuthenticated2, Loan.getPendingEMI);

module.exports = router;