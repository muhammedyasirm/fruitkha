const express = require('express');
const adminRoute = express();

adminRoute.set('view engine','ejs');
adminRoute.set('views','./views');

const adminController = require('../controller/adminController');

const bodyParser = require('body-parser');

const multer = require('multer');

const { storage , cloudinary } = require('../cloudinary');

const upload = multer({storage});

adminRoute.use(bodyParser.json());
adminRoute.use(bodyParser.urlencoded({extended:true}));

adminRoute.get('/adminLogin', adminController.getAdminLogin);

adminRoute.post('/adminLogin',adminController.postAdminLogin);

adminRoute.get('/dashboard' , adminController.getDashboard);

adminRoute.get('/userDetails' , adminController.getUserDetails);

adminRoute.get('/block/:id' , adminController.blockUser);

adminRoute.get('/unblock/:id',adminController.unblockUser);

adminRoute.get('/adminLogout' , adminController.getLogout);

adminRoute.get('/addproducts', adminController.addproducts);

adminRoute.post('/postproduct',upload.array("product_image"),adminController.postAddProduct);

adminRoute.get('/productdetails',adminController.getProductDetails);

adminRoute.get('/editproduct/:id',adminController.editProduct);

adminRoute.post('/post_editproduct/:id',upload.array("product_image"),adminController.postEditProduct);

adminRoute.get('/deleteproduct/:id',adminController.getDelete);

adminRoute.get('/restore/:id',adminController.getRestore);

adminRoute.get('/category',adminController.getCategory);  

adminRoute.post('/addcategory',adminController.addCategory);

adminRoute.post('/editCategory/:id',adminController.editCategory);
 
adminRoute.get('/deletecategory/:id',adminController.deleteCategory); 

adminRoute.get('/order',adminController.getOrders);

adminRoute.get('/orderDetails/:id',adminController.orderDetails);

adminRoute.post('/orderStatusChange/:id',adminController.orderStatusChange);







module.exports = adminRoute;