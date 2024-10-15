const express = require('express');
const router = express.Router();
const session = require('express-session');
const flash = require('express-flash');
const multer = require('multer');
const Role = require('../../controllers/roleController');
const lang = require('../../config/languageconfig');

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/images/upload');
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.use(lang.init);
router.use(session({
  secret: '222222',
  resave: true,
  saveUninitialized: true,
}));
router.use(flash());
const viewAccessMiddleware = require('../../utils/middleware/viewRights');
const addAccessMiddleware = require('../../utils/middleware/addRights');

const isAuthenticated1 = viewAccessMiddleware('role');
const isAuthenticated2 = addAccessMiddleware('role');

router.get('/role/roles', isAuthenticated1, Role.getRoleData);
router.get('/role/roles/delete/:id', isAuthenticated1, Role.getDeleteRole);
router.route('/role/addrole/:id?').get(isAuthenticated2, Role.getAddRole).post(upload.any(), isAuthenticated2, Role.postAddRole);

module.exports = router;