const express = require('express');
const userRoute = express();
//const path=require('path')

userRoute.set('view engine','ejs');
userRoute.set('views','./views');

const userController = require('../controller/userController');

const bodyParser = require('body-parser');

userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({extended: true}));

userRoute.get('/homeN', userController.getHomeN);

userRoute.get('/userLogin',userController.getUserLogin);

userRoute.get('/register', userController.getRegister);

userRoute.post('/postRegister',userController.postRegister);

userRoute.post('/postLogin',userController.postLogin);

//userRoute.post('/Logout',userController.postLogout);

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

userRoute.post('/changeQuantity',userController.changeQuantity);















module.exports = userRoute;