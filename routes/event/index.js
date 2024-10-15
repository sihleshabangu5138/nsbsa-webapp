const express = require('express');
const router = express.Router();
const session = require('express-session');
const flash = require('express-flash');
const lang = require('../../config/languageconfig');
const eventController = require('../../controllers/eventController');

router.use(session({
  secret: '222222',
  resave: true,
  saveUninitialized: true,
}));
router.use(lang.init);
router.use(flash());

const viewAccessMiddleware = require('../../utils/middleware/viewRights');
const addAccessMiddleware = require('../../utils/middleware/addRights');

const isAuthenticated2 = viewAccessMiddleware('events');
const isAuthenticated = addAccessMiddleware('events');

router.route('/events/addevent/:id?').get(isAuthenticated, eventController.getAddEvent).post(isAuthenticated, eventController.postAddEvent);
router.get('/events/eventlist', isAuthenticated2, eventController.getEventList);
router.route('/events/viewevent/:id?').get(isAuthenticated2, eventController.getEventView)

module.exports = router;