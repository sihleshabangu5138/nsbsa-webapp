const express = require('express');
const router = express.Router();
const flash = require('express-flash');
const session = require('express-session');
const Users = require('../../controllers/userControlller');
const multer = require('multer');
const lang = require('../../config/languageconfig');

var storage = multer.diskStorage({

  // file upload destination
  destination: function (req, file, callback) {
    callback(null, 'public/images/upload');
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + '-' + file.originalname);
  }
});
var upload = multer({ storage: storage })

router.use(lang.init);
router.use(session({
  secret: '222222',
  resave: true,
  saveUninitialized: true,
}));

router.use(flash());
const viewAccessMiddleware = require("../../utils/middleware/viewRights");
const addAccessMiddleware = require("../../utils/middleware/addRights")

const isAuthenticated1 = viewAccessMiddleware('user');
const isAuthenticated2 = addAccessMiddleware('user');
const isAuthenticated3 = viewAccessMiddleware('deactiveuser');

function isAuthenticated4(req, res, next) {
  if (req.session.username !== undefined) {
    return next();
  } else {
    res.redirect('/');
  }
}

router.get('/users/userlist', isAuthenticated1, Users.getUserList);
router.get("/users/totaluser", isAuthenticated1, Users.getTotalUserList);
router.get('/users/viewuser/:id?', isAuthenticated1,Users.getViewUser);
router.route('/users/adduser/:id?').get(isAuthenticated2, Users.getAddUser).post(upload.any(), isAuthenticated2, Users.postAddUser);
router.get('/users/deactivateuser', isAuthenticated3, Users.getDeactivateUser);
router.get('/users/deactivateuser/deactivateuser', isAuthenticated3, Users.getDeactivateUserList);
router.get('/users/deactivateuser/delete/:id', isAuthenticated3, Users.deleteActivateUser);
router.get('/users/editprofile/:id?',isAuthenticated4, Users.getEditUser);
router.post('/users/editprofile/:id?',upload.single('photo'),isAuthenticated4, Users.postEditUser);
router.get('/users/apiconfig', isAuthenticated4, Users.getApiConfig);
module.exports = router;