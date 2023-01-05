const express = require('express');
const userRoute = express();
//const path=require('path')

userRoute.set('view engine','ejs');
userRoute.set('views','./views');

const userController = require('../controller/userController');

const bodyParser = require('body-parser');

userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({extended: true}));

userRoute.get('/', userController.getHomeN);

userRoute.get('/userLogin',userController.getUserLogin);

userRoute.get('/register', userController.getRegister);

userRoute.post('/postRegister',userController.postRegister);

userRoute.post('/postLogin',userController.postLogin);

userRoute.get('/userLogout',userController.getLogout);

userRoute.get('/shop',userController.getShop);

userRoute.get('/home',userController.getHome);

userRoute.get('/otp',userController.getOtp);

userRoute.post('/otp',userController.postOtp);

userRoute.get('/productView/:id',userController.getProductView);

userRoute.get('/fruits/:id',userController.getCategory); 

userRoute.get('/addToCart/:id',userController.getCart);

userRoute.get('/viewCart',userController.viewCart);

userRoute.post('/removeProduct',userController.removeProduct);

userRoute.post('/changeQuantity',userController.changeQuantity,userController.totalAmount);

userRoute.get('/checkout',userController.getCheckOutPage);

userRoute.post('/addNewAddress',userController.addNewAddress);

userRoute.post('/placeOrder',userController.placeOrder);

userRoute.get('/orderConfirmation',userController.orderConfirmation);

userRoute.get('/paymentFail',userController.paymentFail);

userRoute.get('/addToWishlist/:id',userController.addToWishlist);

userRoute.get('/viewWishlist',userController.viewWishlist);

userRoute.post('/removeFromWishlist',userController.removeFromWishlist);

userRoute.get('/orders',userController.getOrders);

userRoute.get('/cancelOrder/:id',userController.cancelOrder);

userRoute.get('/viewOrderProduct/:id',userController.viewOrderProducts);

userRoute.get('/userProfile',userController.userProfile);

userRoute.get('/editAccount',userController.editAccount);

userRoute.post('/postEditAccount',userController.postEditAccount);

userRoute.get('/changePassword',userController.changePassword);

userRoute.post('/postChangePassword',userController.changePasswordPost);

userRoute.post('/verifyPayment',userController.verifyPayment);

userRoute.get('/savedAddress',userController.getSavedAddress);

userRoute.post('/editAddress/:id',userController.postEditAddress);

userRoute.get('/deleteAddress/:id',userController.deleteAddress);

userRoute.get('/returnOrder/:id',userController.returnProduct);

userRoute.post('/coupon-check',userController.couponCheck);

userRoute.get('/about',userController.getAbout);

















module.exports = userRoute;