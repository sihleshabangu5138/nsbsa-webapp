const express = require('express');
const router = express.Router();
const session = require('express-session');
const flash = require('express-flash');
const AjaxFun = require('../../controllers/ajaxController');
const lang = require('../../config/languageconfig');

function setCustomSessionTimeout(req, res, next) {
    // Check if the request is for verifyPurchaseKey route
    if (req.url === '/ajxfun/verify-purchase-key') {
        // Set session timeout to 1 minute (in milliseconds)
        req.session.cookie.expires = new Date(Date.now() + 60000); // 1 minute
        req.session.cookie.maxAge = 60000; // 1 minute
    }
    next();
}

router.use(setCustomSessionTimeout);

router.use(session({
	secret: '222222',
	resave: true,
	saveUninitialized: true,
}));
router.use(lang.init);
router.use(flash());

function isAuthenticated(req, res, next) {

	if (req.session.username != undefined) {
		return next();
	} else {
		res.redirect('/');
	}
};

router.get('/ajxfun', isAuthenticated, AjaxFun.getViewUser);
router.get('/ajxfun/deactivateuser', isAuthenticated, AjaxFun.getDeactivateUser);
router.get('/ajxfun/delete/', isAuthenticated, AjaxFun.getDelete);
router.get('/ajxfun/deleteloan/', isAuthenticated, AjaxFun.getDeleteLoan);
router.get('/ajxfun/deletenoti', isAuthenticated, AjaxFun.getDeleteNotification);
router.get('/ajxfun/roles', isAuthenticated, AjaxFun.getRoles);
// router.get('/ajxfun/notilist', isAuthenticated, AjaxFun.getNotiList);
router.get('/ajxfun/customfields', isAuthenticated, AjaxFun.getCustomFields);
router.get('/ajxfun/category', isAuthenticated, AjaxFun.getCategory);
router.get('/ajxfun/service', isAuthenticated, AjaxFun.getService);
router.get('/ajxfun/product', isAuthenticated, AjaxFun.getProduct);
router.get('/ajxfun/events', isAuthenticated, AjaxFun.getEvents);
router.get('/ajxfun/mapevents', isAuthenticated, AjaxFun.getMapEvents);
router.post('/ajxfun/addcategorytype', isAuthenticated, AjaxFun.getAddCategoryType);
router.get('/ajxfun/reminder', isAuthenticated, AjaxFun.getReminder);
router.get('/ajxfun/loantypelist', isAuthenticated, AjaxFun.getLoanTypeList);
router.get('/ajxfun/rules', isAuthenticated, AjaxFun.getRules);
router.get('/ajxfun/notes', isAuthenticated, AjaxFun.getNotes);
router.get('/ajxfun/notificationtemplate', isAuthenticated, AjaxFun.getNotificationTemplate);
router.get('/ajxfun/rules/delete', isAuthenticated, AjaxFun.getRulesDelete);
router.get('/ajxfun/loantype/delete', isAuthenticated, AjaxFun.getLoanTypeDelete);
router.get('/ajxfun/events/delete', isAuthenticated, AjaxFun.getEventsDelete);
router.get('/ajxfun/customfield/delete', isAuthenticated, AjaxFun.getCustomFieldDelete);
router.get('/ajxfun/notes/delete', isAuthenticated, AjaxFun.getNotesDelete);
router.get('/ajxfun/category/delete', isAuthenticated, AjaxFun.getCategoryDelete);
router.post('/ajxfun/clearlog', isAuthenticated, AjaxFun.postClearLog);
router.get('/ajxfun/service/delete', isAuthenticated, AjaxFun.getServiceDelete);
router.get('/ajxfun/product/delete', isAuthenticated, AjaxFun.getProductDelete);
router.get('/ajxfun/roles/delete', isAuthenticated, AjaxFun.getRolesDelete);
router.get('/ajxfun/reminder/delete', isAuthenticated, AjaxFun.getReminderDelete);
router.get('/ajxfun/totalloans', isAuthenticated, AjaxFun.getTotalLoan);
router.get('/ajxfun/loanlist', isAuthenticated, AjaxFun.getLoanList);
router.get('/ajxfun/disapproveloan', isAuthenticated, AjaxFun.getDisApproveLoan);
router.get('/ajxfun/loanlist/delete', isAuthenticated, AjaxFun.getLoanListDelete);
router.get('/ajxfun/notificationtemplate/delete', isAuthenticated, AjaxFun.getNotificationDelete);
router.get('/ajxfun/loantypedesc', isAuthenticated, AjaxFun.getLoanTypeDesc);
router.get('/ajxfun/username', isAuthenticated, AjaxFun.getUserName);
router.get('/ajxfun/pannum', isAuthenticated, AjaxFun.getPanNum);
router.get('/ajxfun/accnum', isAuthenticated, AjaxFun.getAccNum);
router.get('/ajxfun/duplicateemail', isAuthenticated, AjaxFun.getDuplicateEmail);
router.get('/ajxfun/skubarcode', isAuthenticated, AjaxFun.getBarcode);
router.post('/ajxfun/addrole', isAuthenticated, AjaxFun.postAddRole);
router.post('/ajxfun/approveloan', isAuthenticated, AjaxFun.postApproveLoan);
router.post('/ajxfun/state', isAuthenticated, AjaxFun.postState);
router.post('/ajxfun/city', isAuthenticated, AjaxFun.postCity);
router.post('/ajxfun/countrycode', isAuthenticated, AjaxFun.postCcode);
router.get('/ajxfun/checkNodeVersion', AjaxFun.getVersion);
router.post('/ajxfun/checkDatabaseConnection', AjaxFun.connectDatabase);
// router.post('/ajxfun/checkExistingDatabase', AjaxFun.postCheckdbName);
router.post('/ajxfun/check-connection', AjaxFun.postCheckdbConnect);
router.post('/ajxfun/emi_calculator', AjaxFun.postEmiCalculator);
router.post('/ajxfun/verify-purchase-key', AjaxFun.verifyPurchaseKey);


module.exports = router;