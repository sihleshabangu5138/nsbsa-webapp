const express = require('express');
const router = express.Router();
const session = require('express-session');
const flash = require('express-flash');
const multer = require('multer');
const lang = require('../../config/languageconfig');
const Service = require('../../controllers/serviceController');

router.use(session({
  secret: '222222',
  resave: true,
  saveUninitialized: true,
}));
router.use(lang.init);
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/images/upload');
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  },
});
const upload = multer({ storage: storage });
router.use(flash());

const viewAccessMiddleware = require('../../utils/middleware/viewRights');
const addAccessMiddleware = require('../../utils/middleware/addRights');

const isAuthenticated1 = viewAccessMiddleware('service');
const isAuthenticated2 = addAccessMiddleware('service');

router.get('/service/servicelist', isAuthenticated1, Service.getServiceList);
router.get('/service/addservice/:id?', isAuthenticated2, Service.getAddService);
router.post('/service/addservice/:id?', upload.any(), isAuthenticated2, Service.postAddService);

module.exports = router;