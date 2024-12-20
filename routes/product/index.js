const express = require('express');
const router = express.Router();
const flash = require('express-flash');
const session = require('express-session');
const multer = require('multer');
const lang = require('../../config/languageconfig');
const productRouter = require('../../controllers/productController');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'public/images/upload');
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
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

const isAuthenticated1 = viewAccessMiddleware('product');
const isAuthenticated2 = addAccessMiddleware('product');

router.get('/product/productlist', isAuthenticated1, productRouter.getProductList);
router.get('/product/viewproduct/:id?', isAuthenticated1, productRouter.getViewProduct);
router.route('/product/addproduct/:id?').get(isAuthenticated2, productRouter.getAddProduct).post(upload.any(), isAuthenticated2, productRouter.postAddProduct);


module.exports = router;