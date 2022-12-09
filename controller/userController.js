const express = require('express');

const users = require('../model/userModel');

const body = require('body-parser');

const userRoute = require('../userRoute/userRoute');

const session = require('express-session');

const product = require('../model/productModel');

const categories = require('../model/categoryModel');

const nodemailer = require('nodemailer');

const otp = require('../model/otp');

const cart = require('../model/cartModel');

const user = require('../model/userModel');
const { default: mongoose } = require('mongoose');




let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user:'yasernazer@gmail.com',
        pass: 'zbynhnbiasfjqmey'
    }
});

const getHomeN = async(req,res)=>{
    const session = req.session.consumer
    if(session){
        customer = true;
    } else{
        customer = false;
    }
    let products = await product.find();
    res.render('user/index',{customer,products});
}

const getUserLogin = (req,res)=>{
    res.render('user/login')
}

const getRegister = (req,res) =>{
    res.render('user/register')
}

const postRegister = async (req,res)=>{
 console.log('entered');
        
    let Fullname = req.body.Fullname
    let Email = req.body.Email
    let Phonenumber = req.body.Phone
    let Password = req.body.Password

    const OTP = `${Math.floor(1000 + Math.random()*9000)}`

    let mailDetails = {
        from: 'yasernazer@gmail.com',
        to: Email,
        Subject: 'Verification',
        html: `<p>Your OTP for registering in Fruitkha is ${OTP}</p>`
    };

    const User = await users.findOne({Email: Email});
    //console.log(User);
    if(User) {
        res.render('user/register',{exist_message: 'User Already Exist'});
    } else {
        const user = await users.create({
            Fullname: Fullname,
            Email: Email,
            Phonenumber: Phonenumber,
            Password: Password
        })

        mailTransporter.sendMail(mailDetails,async function(err,data){
            if(err) {
                console.log(err)
            } else {
                const otpActive = await otp.create({
                    userId: user.id,
                    otp: OTP
                })
                res.redirect(`/otp?email=${user.Email}`);
            }
        })
    } 

}

const getOtp = async(req,res) =>{
    let {email} = req.query
    const user = await users.findOne({Email:email})
    res.render('user/otp', {user});
}

const postOtp = async(req,res)=>{
    let body = req.body;
    console.log(body)
    const verify = await otp.findOne({
        userId:body.userId
    })
    if (body.otp == verify.otp){
        let user = await users.findByIdAndUpdate({_id:body.userId},{isActive:true})
        res.redirect('/userLogin');
    } else {
        res.redirect(`/otp?email=${user.Email}`);
    }
//     if(OTP === otp){
//         try {
//             const user = await users.create({
//                 Fullname: Fullname,
//                 Email: Email,
//                 Phonenumber: Phonenumber,
//                 Password: Password

//             })
//         } catch (error) {
//             console.log('Error Happened');
//         }
//         res.redirect('/userLogin');
//     } else {
//         res.redirect('/otp');
//     }
};




const postLogin = async(req,res) =>{
    const {Email,Password} = req.body;
    const consumer = await users.findOne({Email});
    if(consumer){
    if (consumer.Block===false && consumer.isActive===true)
    {
        if(Email == consumer.Email && Password == consumer.Password) 
           {
            
            req.session.consumer = req.body.Email;
            
            res.redirect('/homeN')
           }else{
            res.render('user/login', { invalid: "Inavlid User"});
            console.log('error')
           }
        } else {
        res.render('user/login',{block: "You are Blocked"}); 
    }
}else{
    res.render('user/login', { invalid: "Inavlid User"});
}
}

const getLogout = (req,res) =>{
        try{
            req.session.destroy()
            res.redirect('/homeN')
        } catch (error) {
            console.log('error');
        }
}

const getShop = async(req,res) =>{
    let category = await categories.find()
    const session = req.session.consumer;
    if(session){
        customer = true;
    } else {
        customer = false;
    }
    let allProducts = await product.find()
    res.render('user/shop',{allProducts,customer,category});
}

const getHome = (req,res) =>{
    res.redirect('/homeN');
}

const getProductView = async(req,res)=>{
    const session = req.session.consumer;
    if(session){
        customer = true;
    } else {
        customer = false;
    }
     const id = req.params.id;
    const productSingle = await product.findOne({_id:id});
    res.render('user/singleProduct',{productSingle,customer});
    console.log(productSingle);

}

const getCategory = async (req,res)=>{
    try{
        const session = req.session.consumer;
    if(session){
        customer = true;
    } else {
        customer = false;
    }
    const id = req.params.id;
    const category = await categories.find();
    const categoryProduct = await categories.findOne({_id:id});
    console.log(categoryProduct);
    if (categoryProduct){
        product.find({category:categoryProduct._id}).then((allProducts)=>{
            res.render('user/shop',{allProducts,category})
            console.log(allProducts);
        })
    } else {
        res.render('user/shop');
    }
}catch(err){
    console.log(err);
}
}

const getCart = async(req,res)=>{
    if(req.session.consumer){
    const id = req.params.id;
    const objId = mongoose.Types.ObjectId(id);
    //console.log(objId)
    const session = req.session.consumer;
    if(session){
        customer = true;
    } else {
        customer = false;
    }
    
    let proObj = {
        productId : objId,
        quantity : 1
    };
    const userData = await users.findOne({Email : session});
    //console.log(userData);
    const userCart = await cart.findOne({userId : userData._id});
    if (userCart){
        let proExist = userCart.product.findIndex(
            (product)=> product.productId == id
        )
        if (proExist != -1){
           let hi =  await cart.updateOne(
                { userId : userData._id , 'product.productId' : objId},
             {$inc:{'product.$.quantity': 1}}
            )
            res.redirect('/shop')
        } else {
            cart.updateOne({
                userId:userData._id
            },
            {
                $push: {
                    product : proObj
                }
            }
            ).then(()=>{
                res.redirect('/shop')
            })
        }
    } else {
        const newCart = new cart({
            userId : userData._id,
            product:[
                {
                    productId : objId,
                    quantity : 1
                }
            ]
        });
        newCart.save().then(()=>{
            res.redirect('/shop');
        }
        )
    }
} else {
    res.redirect('/userLogin')
}
}

const viewCart = async(req,res) =>{
    const session = req.session.consumer;
    if(req.session.consumer){
        if(session){
            customer = true;
        } else {
            customer = false;
        }
        const userData = await users.findOne({Email:session});
        const productData = await cart.aggregate([
            {
                $match : { userId : userData._id},
            },
            {
                $unwind : "$product",
            },
            {
                $project: {
                    productItem: "$product.productId",
                    productQuantity: "$product.quantity"
                },
            },
            {
                $lookup:{
                    from : "products",
                    localField: "productItem",
                    foreignField: "_id",
                    as : "productDetail"
                },
            },
            {
                $project : {
                    productItem : 1,
                    productQuantity: 1,
                    productDetail : { $arrayElemAt:["$productDetail",0]},
                },
            },
            {
                $addFields:{
                    productPrice:{
                        $multiply:["$productQuantity", "$productDetail.price"]
                    }
                }
            }
        ])
        .exec();
        const sum = productData.reduce((accumulator,object)=>{
            return accumulator+object.productPrice;
        },0);
        console.log('hio');
        console.log(productData);
        countInCart = productData.length;
        if(sum>1000){
          shipping = 0;
        } else {
            shipping = 75
        }
        res.render('user/cart',{productData , sum , countInCart , customer , shipping})
    } else {
        res.redirect('/userLogin');
    }
}

const removeProduct = async(req,res)=>{
    const data = req.body;
    console.log(data)
    const objId = mongoose.Types.ObjectId(data.product);
    await cart.aggregate([
        {
            $unwind : "$product"
        }
    ])

    await cart.updateOne(
        {
            _id : data.cart,"product.productId":objId
        },
        {
            $pull:{product: {productId:objId}}
        }
    )
        res.json({status : true});
}

const changeQuantity = async(req,res)=>{
    const data = req.body;
    //console.log(data)
    const objId = mongoose.Types.ObjectId(data.product);
    //console.log(objId);
    cart.updateOne(
        {
        _id:data.cart,"product.productId":objId
        },
        {$inc: { "product.$.quantity":data.count}}
    ).then(()=>{
        res.json({status:true});

    })
}


















module.exports = {  getHomeN,getUserLogin,getRegister,postRegister,postLogin,
                    getLogout,getShop,getHome,getProductView,getCategory,getOtp,
                    postOtp,getCart,viewCart,removeProduct,changeQuantity};