const express = require('express');
const router = express.Router();
const session = require('express-session');
const flash = require('express-flash');
const noteController = require('../../controllers/noteController');
const lang = require('../../config/languageconfig');
const viewAccessMiddleware = require("../../utils/middleware/viewRights")

router.use(session({
  secret: '222222',
  resave: true,
  saveUninitialized: true,
}));
router.use(lang.init);
router.use(flash());

const isAuthenticated = viewAccessMiddleware('notes');

router.get('/notes/notelist', isAuthenticated, noteController.getNoteList);
router.route('/notes/viewnote/:id?').get(isAuthenticated, noteController.getViewNote);

module.exports = router;