const express = require('express');
const router = express.Router();
const session = require('express-session');
const flash = require('express-flash');
const lang = require('../../config/languageconfig');
const NotificationTemplate = require('../../controllers/notificationTemplateController');

router.use(session({
  secret: '222222',
  resave: true,
  saveUninitialized: true,
}));
router.use(lang.init);
router.use(flash());


const viewAccessMiddleware = require('../../utils/middleware/viewRights');
const addAccessMiddleware = require('../../utils/middleware/addRights');

const isAuthenticated = viewAccessMiddleware('notification');
const isAuthenticated2 = addAccessMiddleware('notification');

router.get('/notification/notificationtemplate', isAuthenticated, NotificationTemplate.getNotificationTemplateList);
router.route('/notification/addnotificationtemplate/:id?').get(isAuthenticated2, NotificationTemplate.getAddNotificationTemplate).post(isAuthenticated2, NotificationTemplate.postAddNotificationTemplate);

module.exports = router;