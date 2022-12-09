const express = require('express');
const adminRoute = express();

adminRoute.set('view engine','ejs');
adminRoute.set('views','./views');

const adminController = require('../controller/adminController');

const bodyParser = require('body-parser');
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

adminRoute.post('/postproduct',adminController.postAddProduct);

adminRoute.get('/productdetails',adminController.getProductDetails);

adminRoute.get('/editproduct/:id',adminController.editProduct);

adminRoute.post('/post_editproduct/:id',adminController.postEditProduct);

adminRoute.get('/deleteproduct/:id',adminController.getDelete);

adminRoute.get('/category',adminController.getCategory);  

adminRoute.post('/addcategory',adminController.addCategory);

adminRoute.post('/editCategory/:id',adminController.editCategory);
 
adminRoute.get('/deletecategory/:id',adminController.deleteCategory); 







module.exports = adminRoute;