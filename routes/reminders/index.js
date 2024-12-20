const express = require('express');
const router = express.Router();
const session = require('express-session');
const flash = require('express-flash');
const multer = require('multer');
const lang = require('../../config/languageconfig');
const Reminder = require('../../controllers/reminderController');

router.use(session({
  secret: '222222',
  resave: true,
  saveUninitialized: true,
}));
router.use(lang.init);
router.use(flash());

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'public/images/upload');
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  },
});
const upload = multer({ storage: storage });

const viewAccessMiddleware = require('../../utils/middleware/viewRights');
const addAccessMiddleware = require('../../utils/middleware/addRights');

const isAuthenticated1 = viewAccessMiddleware('reminder');
const isAuthenticated2 = addAccessMiddleware('reminder');

router.get('/reminder/reminders', isAuthenticated1, Reminder.getReminderList);
router.get('/reminder/reminders/delete/:id', isAuthenticated1, Reminder.deleteReminder);
router.route('/reminder/addreminder/:id?').get(isAuthenticated2, Reminder.getAddReminder).post(upload.any(), isAuthenticated2, Reminder.postAddReminder);
router.route('/reminder/reminderslist').get(isAuthenticated1, Reminder.getReminderCuslist);

module.exports = router;