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

const moment = require('moment');

const order = require('../model/order')

const instance = require("../middlewares/razorpay")

const crypto = require("crypto");

const user = require('../model/userModel');

const { default: mongoose } = require('mongoose');

const wishlist = require('../model/wishlist');

const coupon = require('../model/coupen');




let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user:'castleicecreams@gmail.com',
        pass: 'wnybnjcalurvjwrh'
    }
});

const getHomeN = async(req,res)=>{
    const session = req.session.consumer
    if(session){
        customer = true;
    } else{
        customer = false;
    }
    let products = await product.find({}).limit(3);
    res.render('user/index',{customer,products});
}

const getUserLogin = (req,res)=>{
    res.render('user/login')
}

const getRegister = (req,res) =>{
    res.render('user/register')
}

const postRegister = async (req,res)=>{
        
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
            req.session.userId = consumer._id;
            
            res.redirect('/')
           }else{
            res.render('user/login', { invalid: "Inavlid User"});
           }
        } else {
        res.render('user/login',{block: "You are Blocked"}); 
    }
}else{
    res.render('user/login', { invalid: "Invalid User"});
}
}

const getLogout = (req,res) =>{
        try{
            req.session.destroy()
            res.redirect('/')
        } catch (error) {
            res.render('user/500');
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
    res.redirect('/');
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
    const length = productSingle.image.length;
    console.log("length",length);
    res.render('user/singleProduct',{productSingle,customer,length});
    console.log("ProductSingle",productSingle.image);

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
    const userCart = await cart.findOne({userId : userData._id});
    if (userCart){
        let proExist = userCart.product.findIndex(
            (product)=> product.productId == id
        )
        if (proExist != -1){
             await cart.updateOne(
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
        try{
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
                        $multiply:["$productQuantity","$productDetail.price"]
                    }
                }
            }
        ])
        .exec();
        const sum = productData.reduce((accumulator,object)=>{
            return accumulator+object.productPrice;
        },0);
        countInCart = productData.length;
        res.render('user/cart',{productData , sum , countInCart , customer })
    } catch(error){
        res.render('user/500');
    }
    } else {
        res.redirect('/userLogin');
    }
}

const removeProduct = async(req,res)=>{
    const data = req.body;
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

const totalAmount = async(req,res) =>{

    const userId = req.session.consumer;
    const userData = await users.findOne({Email:userId});
    const objId = mongoose.Types.ObjectId(userData.id);
    const product = mongoose.Types.ObjectId(req.body.product);
    if(req.session.consumer){
        if(userId){
            customer = true;
        } else {
            customer = false;
        }
    }
    const productData = await cart.aggregate([
        {
            $match: { userId:objId},
        },
        {
            $unwind:"$product",
        },
        {
            $project:{
                productItem: "$product.productId",
                productQuantity:"$product.quantity"
            },
        },
        {
            $lookup:{
                from:"products",
                localField:"productItem",
                foreignField:"_id",
                as:"productDetail"
            },
        },
        {
            $project:{
                productItem : 1,
                productQuantity : 1,
                productDetail : {$arrayElemAt : ["$productDetail",0]},
            },
        },
        {
            $addFields:{
                productPrice: {
                    $multiply: ["$productQuantity","$productDetail.price"],
                },
            },
        },
        {
            $group:{
                _id:userData.id,
                total:{
                    $sum:{ $multiply:["$productQuantity","$productDetail.price"]},
                },
                productPrice: {
                    $push: {
                        item: "$productItem",
                        price: "$productPrice",
                    },
                },
            }
        },
        {
            $project: {
                total: 1,
                _id: 1,                
                product: {
                    $filter: {
                       input: "$productPrice",
                       as: "num",
                       cond: { $eq: ["$$num.item", product] }
                    }
                  }
            }
        }
    ]).exec();
    res.json({status:true,productData:productData[0]});
   
}

const changeQuantity = async(req,res,next)=>{
    const session = req.session.consumer
    if(session){
        customer = true;
    } else{
        customer = false;
    }
    const data = req.body;
    const objId = mongoose.Types.ObjectId(data.product);
    const productDetail = await product.findOne({ _id: data.product });
    data.count = parseInt(data.count);
    data.quantity = parseInt(data.quantity);
    if(data.count==-1 && data.quantity==1){
        res.json({quantity:true})
    }else if (data.count == 1 && data.quantity == productDetail.stock) {
        res.json({ stock: true });

     }else{
        cart.updateOne(
            {
            _id:data.cart,"product.productId":objId
            },
            {$inc: { "product.$.quantity":data.count}}
        ).then(()=>{
            next();
    
        })
    }

    
}

const getCheckOutPage = async(req,res) => {
    if(req.session.consumer){
    let session = req.session.consumer;
    if(session){
        customer = true;
    } else{
        customer = false;
    }
    const userData = await user.findOne({Email:session})
    if(session){
            customer = true;
        } else {
            customer = false;
        }

        const productData = await cart.aggregate([
            {
                $match: {userId: userData._id},
            },
            {
                $unwind:"$product"
            },
            {
                $project:{
                    productItem:"$product.productId",
                    productQuantity:"$product.quantity"
                }
            },
            {
                $lookup:{
                    from:"products",
                    localField:"productItem",
                    foreignField:"_id",
                    as:"productDetail"
                }
            },
            {
                $project:{
                    productItem : 1,
                    productQuantity:1,
                    productDetail:{$arrayElemAt:["$productDetail",0]}
                }
            },
            {
                $addFields:{
                    productPrice:{
                        $multiply:["$productQuantity","$productDetail.price"]
                    }
                }
            }
        ]).exec();
        const sum = productData.reduce((accumulator,object)=>{
            return accumulator + object.productPrice;
        },0);
            res.render('user/checkout',{productData,sum,countInCart,userData});

    }else{
        res.redirect('/userLogin');
    }
}

    const addNewAddress = async(req,res)=>{
        if(req.session.consumer){
            try{
        const session = req.session.consumer;
    if(session){
        customer = true;
    } else{
        customer = false;
    }
        console.log('Add new address session  =  ',session);

        const addObj = {
            apartment: req.body.housename,
            area: req.body.area,
            landmark: req.body.landmark,
            district:req.body.district,
            state:req.body.state,
            postoffice:req.body.postoffice,
            pin:req.body.pin
        }
        await user.updateOne({Email:session},{$push:{addressDetails:addObj}})
        res.redirect('/checkout')
    }catch{
        res.render('user/500');
    }
    } else{
        res.redirect('/userLogin');
    }
}

const placeOrder = async(req,res)=>{
    if(req.session.consumer){
    try {
        const data = req.body;
        const session = req.session.consumer;
    if(session){
        customer = true;
    } else{
        customer = false;
    }
        const userData = await user.findOne({ Email: session })
        const objId = mongoose.Types.ObjectId(userData._id);

        const coupons = await coupon.findOne({coupon_code:data.coupon});
        if(coupons){
            await coupon.updateOne({coupon_code:data.coupon},{$push:{used_user_id:objId}});
        } 

        user.findOne({_id:objId}).then((userData)=>{
            cart.aggregate([
                {
                    $match:{userId:userData._id}
                },
                {
                    $unwind:'$product'
                },
                {
                    $project:{
                        productItem:'$product.productId',
                        productQuantity:'$product.quantity'
                    }
                },
                {
                    $lookup:{
                        from:'products',
                        localField:'productItem',
                        foreignField:'_id',
                        as:'productDetail'
                    }
                },
                {
                    $project:{
                        productItem:1,
                        productQuantity:1,
                        productDetail:{$arrayElemAt:['$productDetail',0]}
                    }
                },
                {
                $addFields:{
                    productPrice:{
                        $sum:{$multiply:['$productQuantity','$productDetail.price']}
                    }
                }
            }
            ]).exec().then((result)=>{
            for(let i = 0;i < result.length;i++){
                const csstock = result[i].productDetail.stock - result[i].productQuantity;
                product.findByIdAndUpdate(
                    {_id:result[i].productDetail._id},
                    {stock:csstock},
                ).then(()=>{}).catch(()=>{
                    res.render('user/500');
                })
            }
            let dis = 0;
            let tamount = 0;
            const sum = result.reduce((accumulator,object)=>accumulator + object.productPrice,0);
            if(coupons){
                dis = (Number(sum)*Number(coupons.offer))/100;
                if(dis > Number(coupons.max_amount)){
                    dis = Number(coupons.max_amount);
                }
                tamount = sum - dis;
            } else {
                tamount = sum ;
            }
            cart.findOne({userId:userData._id}).then((cartData)=>{
                const orders = new order({
                    userId:userData._id,
                    name:userData.Fullname,
                    phonenumber:userData.Phonenumber,
                    address:req.body.address,
                    orderItems:cartData.product,
                    totalAmount:sum,
                    discountAmount:tamount,
                    discount:dis,
                    paymentMethod:req.body.pay,
                    orderDate:moment().format("MMM Do YY"),
                    deliveryDate:moment().add(3,"days").format("MMM Do YY")
                });
                orders.save().then((done)=>{
                    const oid = done._id;
                    cart.deleteOne({userId:userData._id}).then(()=>{
                        if(req.body.pay === "cod"){
                            res.json([{ success: true, oid }]);
                        } else if(req.body.pay ==="online"){
                            const amount = Number(done.discountAmount * 100);
                            console.log("Place order  =  ",amount);
                            const options = {
                                amount:amount,
                                currency:'INR',
                                receipt:`${oid}`
                            };
                            instance.orders.create(options,(err,orders)=>
                            {
                                if(err){
                                    console.log(err)
                                } else {
                                    res.json([{success:false,orders}]);
                                }
                            });
                        }
                    });
                });
            });
        });
    });
} catch(error){
    res.render('user/500');
    }
}else{
    res.redirect('/userLogin');
}
};

const couponCheck = async(req,res)=>{
    const uid = req.session.userId;
    const {code,amount} = req.body;
    const check = await coupon.findOne({coupon_code:code});
    if(check){
        let used = false;
        for(let i =0;i<check.used_user_id.length;i++){
            const element = check.used_user_id[i];
            if(element == uid){
                used = true;
            }
        }
        if(!used){
            let discount = 0;
            const off = (Number(amount) * Number(check.offer))/100;
            if(off>Number(check.max_amount)){
                discount = Number(check.max_amount);
            } else {
                discount = off;
            }
            res.json([
                {
                    success:true,dis:discount,code
                },
                {check},
            ])
        }else{
            res.json([{success:false,message:'Coupon already used'}]);
        }
    }else{
        res.json([{success:false,message:'Coupon Invalid'}])
    }
};

    const orderConfirmation = (req,res)=>{
        if(req.session.consumer){
            try{
                const session = req.session.consumer
                    if(session){
                        customer = true;
                    } else{
                        customer = false;
                    }
            res.render('user/orderConfirmation');
            }catch(error){
                res.render('user/500');
            }
        }else{
            res.redirect('/userLogin');
        }

        
    }

    const addToWishlist = async(req,res)=>{
        if(req.session.consumer){
        try {
            const id = req.params.id;
            const objId = mongoose.Types.ObjectId(id);
            const session = req.session.consumer;
                    if(session){
                        customer = true;
                    } else{
                        customer = false;
                    }

            let proObj = {
                productId: objId
            };
            const userData = await user.findOne({Email:session});
            const userWishlist = await wishlist.findOne({userId:userData._id});
            if(userWishlist){
                let proExist = userWishlist.product.findIndex(
                    (product)=>product.productId==id);
                    if(proExist!=-1){
                        console.log("productExist",proExist);
                        res.json({productExist:true})
                    } else{
                        wishlist.updateOne(
                            {userId:userData._id},{$push:{product:proObj}}
                        ).then(()=>{
                            res.json({status:true})
                        });
                    }
            } else {
                const newwishlist = new wishlist({
                    userId:userData._id,
                    product:[
                        {
                            productId:objId
                        }
                    ]
                });
                newwishlist.save().then(()=>{
                    res.json({status:true});
                })
            }
        } catch (error) {
            res.render('user/500');
        }
    }else{
        res.redirect('/userLogin');
    }
}

const viewWishlist = async(req,res)=>{
    if(req.session.consumer){
        try{
           const session = req.session.consumer;
                if(session){
                    customer = true;
                } else{
                    customer = false;
                }
           const userData = await user.findOne({Email:session});
           const userId = mongoose.Types.ObjectId(userData._id);

           const wishlistData = await wishlist.aggregate([
            {
                $match:{userId:userId}
            },
            {
                $unwind:"$product"
            },
            {
                $project:{
                    productItem:"$product.productId"
                }
            },
            {
                $lookup:{
                    from:"products",
                    localField:"productItem",
                    foreignField:"_id",
                    as:"productDetail"
                }
            },
            {
                $project:{
                    productItem:1,
                    productDetail:{$arrayElemAt:["$productDetail",0]}
                }
            },
           ])
           console.log("wishlistData  =  ",wishlistData);
           countInWishlist = wishlistData.length;
           res.render('user/wishlist',{wishlistData,countInWishlist})
        } catch(error){
            res.render('user/500');
        }
    }else{
        res.redirect('/userLogin');
    }
}

const removeFromWishlist = async(req,res)=>{
    if(req.session.consumer){
        try {
            const data = req.body;
            const objId = mongoose.Types.ObjectId(data.productId);
            await wishlist.aggregate([
                {
                    $unwind:"$product"
                }
            ]);
            await wishlist.updateOne(
                {_id:data.wishlistId,"product.productId":objId},
                {$pull:{product:{productId:objId}}}
            ).then(()=>{
                res.json({status:true})
            })
        } catch (error) {
            res.render('user/500');
        }
    }else{
        res.redirect('/userLogin');
    }
}

const getOrders = async(req,res)=>{
    if(req.session.consumer){
        try {
            const session = req.session.consumer;
                if(session){
                    customer = true;
                } else{
                    customer = false;
                }
            const userData = await user.findOne({Email:session});
            const orderb = order.find({userId:userData._id}).sort({createdAt:-1}).then((orderDetails)=>{
                res.render('user/order',{orderDetails})
            })
        } catch (error) {
            res.render('user/500'); 
        }
    }else{
        res.redirect('/userLogin');
    }
}

const cancelOrder = async(req,res)=>{
    if(req.session.consumer){
        try {
            const session = req.session.consumer
                if(session){
                    customer = true;
                } else{
                    customer = false;
                }
            const data = req.params.id;
            const objId = mongoose.Types.ObjectId(data);
            const orderData = await order.aggregate([
                {
                    $match:{_id:objId}
                },
                {
                    $unwind:"$orderItems"
                },
                {
                    $lookup:{
                        from:"products",
                        localField:"orderItems.productId",
                        foreignField:"_id",
                        as:"productDetail"
                    }
                },
                {
                    $project:{
                        quantity:"$orderItems.quantity",
                        productDetail:{$arrayElemAt:["$productDetail",0]}
                    }
                }
            ]);
            console.log("Order Data in cancel  = ",orderData);
            for(let i=0;i<orderData.length;i++){
                const updatedStock = orderData[i].productDetail.stock + orderData[i].quantity;
             product.updateOne(
                {
                    _id:orderData[i].productDetail._id
                },
                {
                    stock:updatedStock
                }
             ).then((data)=>{
                console.log(data);
             }) 
            }
             order.updateOne({_id:data},{$set:{orderStatus:"Cancelled"}}).then(()=>{
                res.redirect('/orders');
            }) 
        } catch (error) {
            res.render('user/500');
        }
    }else{
        res.redirect('/userLogin');
    }
}

const returnProduct = async(req,res)=>{
    if(req.session.consumer){
        try {
            const session = req.session.consumer;
                if(session){
                    customer = true;
                } else{
                    customer = false;
                }
            const userData = await user.findOne({Email:session});
            const data = req.params.id;
            const objId = mongoose.Types.ObjectId(data);
            const orderData = await order.aggregate([
                {
                    $match:{_id:objId}
                },
                {
                    $unwind:"$orderItems"
                },
                {
                    $lookup:{
                        from:"products",
                        localField:"orderItems.productId",
                        foreignField:"_id",
                        as:"productDetail"
                    }
                },
                {
                    $project:{
                        quantity:"$orderItems.quantity",
                        productDetail:{$arrayElemAt:["$productDetail",0]}
                    }
                },
                    {
                        $addFields:{
                            productPrice:{
                                $multiply:["$quantity","$productDetail.price"]
                            }
                        }
                    }
            ]);
            const sum = orderData.reduce((accumulator,object)=>{
                return accumulator + object.productPrice;
            },0);
            for(let i=0;i<orderData.length;i++){
                const updatedStock = orderData[i].productDetail.stock + orderData[i].quantity;
             product.updateOne(
                {
                    _id:orderData[i].productDetail._id
                },
                {
                    stock:updatedStock
                }
             ).then((data)=>{
                console.log(data);
             }) 
            }
             order.updateOne({_id:data},{$set:{orderStatus:"Return Pending"}}).then(()=>{
                res.redirect('/orders');
            })
        } catch (error) {
            res.render('user/500');
        }
    }else{
        res.redirect('/userLogin');
    }
}

const viewOrderProducts = async(req,res)=>{
    if(req.session.consumer){
        try {
            const session = req.session.consumer;
                if(session){
                    customer = true;
                } else{
                    customer = false;
                }
            const id = req.params.id;
            const objId = mongoose.Types.ObjectId(id);
            const userData = await user.findOne({Email:session});
            order.aggregate([
                {
                    $match:{_id:objId}
                },
                {
                    $unwind:"$orderItems"
                },
                {
                    $project:{
                        address:"$address",
                        totalAmount:"$totalAmount",
                        phonenumber:"$phonenumber",
                        productItem:"$orderItems.productId",
                        productQuantity:"$orderItems.quantity",
                        discount:"$discount",
                        name:"$name",
                        paymentMethod:"$paymentMethod",
                        paymentStatus:"$paymentStatus",
                        orderDate:"$orderDate",
                        orderStatus:"$orderStatus"
                    }
                },
                {
                    $lookup:{
                        from:"products",
                        localField:"productItem",
                        foreignField:"_id",
                        as:"productDetail"
                    }
                },
                {
                    $project:{
                        address:1,
                        totalAmount:1,
                        phonenumber:1,
                        productQuantity:1,
                        discount:1,
                        name:1,
                        paymentMethod:1,
                        paymentStatus:1,
                        orderDate:1,
                        orderStatus:1,
                        productDetail:{$arrayElemAt:["$productDetail",0]}
                    }
                },
                {
                    $lookup:{
                        from:'categories',
                        localField:'productDetail.category',
                        foreignField:'_id',
                        as:'category_name'
                    }
                },
                {
                    $unwind:'$category_name'
                }
            ]).then((productData)=>{
                console.log("ViewOrder ProductData  = ",productData);
                res.render("user/viewOrderProduct",{productData})
            })
        } catch (error) {
            res.render('user/500');
        }
    }else{
        res.redirect('/userLogin');
    }
}

const userProfile = async(req,res)=>{
    if(req.session.consumer){
        try {
            const session = req.session.consumer;
                if(session){
                    customer = true;
                } else{
                    customer = false;
                }
            const userData = await user.findOne({Email:session});
            res.render('user/userProfile',{userData}) 
        } catch (error) {
            res.render('user/500');
        }
    } else {
        res.redirect('/userLogin');
    }
}

const editAccount = async(req,res)=>{
    if(req.session.consumer){
        try {
            const session = req.session.consumer;
            const userData = await user.findOne({Email:session});
            res.render('user/editAccount',{userData})
        } catch (error) {
            res.render('user/500');  
        }
    }else{
        res.redirect('/userLogin');
    }
}

const postEditAccount = async(req,res)=>{
    if(req.session.consumer){
        try {
            const session = req.session.consumer;
                if(session){
                    customer = true;
                } else{
                    customer = false;
                }
            const data = req.body;
            await user.updateOne({
                Email:session
            },
            {
                $set:{
                    Fullname:data.fullname,
                    Phonenumber:data.phonenumber
                }
            }) 
            res.redirect('/userProfile')
        } catch (error) {
            res.render('user/500');
        }
    }else{
        res.redirect('/userLogin');
    }
}

const changePassword = (req,res)=>{
    if(req.session.consumer){
        try {
            const session = req.session.consumer
                if(session){
                    customer = true;
                } else{
                    customer = false;
                }
           res.render('user/changePassword',{message:''}) 
        } catch (error) {
            res.render('user/500');
        }
    }else{
        res.redirect('/userLogin')
    }
}

const changePasswordPost = (req,res)=>{
    try {
        const session = req.session.consumer;
            if(session){
                customer = true;
            } else{
                customer = false;
            }
        const {currentPassword,password} = req.body;
        user.findOne({Email:session}).then((result)=>{
            if(result.Password===currentPassword){
                if(password === currentPassword){
                    res.render('user/ChangePassword',{message:'Old password and New password is same'});
                }else{
                    user.findOneAndUpdate({Email:session},{Password:password}).then(()=>{
                        res.redirect('/userProfile');
                    }).catch(()=>{
                        console.log("error in Change Password");
                    });
                }
            }else{
                res.render('user/changePassword',{message:'You have entered wrong password'});
            }
        }).catch(()=>{
            console.log("Something wrong");
        })
    } catch (error) {
        res.render('user/500');
    }
}

const verifyPayment = async (req, res) => {

    const details = req.body;
    let hmac = crypto.createHmac("sha256", process.env.SECRET);
    hmac.update(details.payment.razorpay_order_id + "|" + details.payment.razorpay_payment_id);
    hmac = hmac.digest("hex");

    if (hmac == details.payment.razorpay_signature) {

      const objId = mongoose.Types.ObjectId(details.order.receipt);
      order.updateOne({ _id: objId }, { $set: { paymentStatus: "paid", orderStatus: 'Placed' } }).then(() => {

        res.json({ success: true });

      }).catch((err) => {
        console.log(err);
        res.json({ status: false, err_message: "payment failed" });
      })

    } else {
      console.log(err);
      res.json({ status: false, err_message: "payment failed" });
    }
  }

  const paymentFail = (req,res)=>{
    if(req.session.consumer){
        try {
            const session = req.session.consumer
                if(session){
                    customer = true;
                } else{
                    customer = false;
                }
           res.render('user/paymentFail') 
        } catch (error) {
            res.render('user/500');
        }
    }
  }

  const getSavedAddress = async(req,res)=>{
    if(req.session.consumer){
        try {
            const session = req.session.consumer;
                if(session){
                    customer = true;
                } else{
                    customer = false;
                }
            const userData = await user.findOne({Email:session})
            res.render('user/savedAddress',{userData});
        } catch (error) {
            res.render('user/500');
        }
    }
  }

  const postEditAddress = async(req,res)=>{
    if(req.session.consumer){
        
        try {
            const session = req.session.consumer;
                if(session){
                    customer = true;
                } else{
                    customer = false;
                }
            const userId = await user.findOne({Email:session});
            const AddressId = req.params.id;
            const housename = req.body.housename;
            const area = req.body.area;
            const landmark = req.body.landmark;
            const district = req.body.district;
            const state = req.body.state;
            const postoffice = req.body.postoffice;
            const pin = req.body.pin;

            const updatedAddress = {
             apartment:housename,area:area,landmark:landmark,district:district,state:state,pin:pin,postoffice:postoffice
            }

            await user.findOneAndUpdate({_id:userId, "addressDetails._id":AddressId },{$set:{"addressDetails.$":updatedAddress}})
            res.redirect('/userProfile');
        } catch (error) {
            res.render('user/500');
        }
    }else{
        res.redirect('/userLogin');
    }
  }

  const deleteAddress = async(req,res)=>{
    if(req.session.consumer){
        try {
            const session = req.session.consumer;
                if(session){
                    customer = true;
                } else{
                    customer = false;
                }
            const userId = await user.findOne({Email:session});
            const addressId = req.params.id;
            await user.updateOne(
                {
                _id:userId,
                },
                {
                    $pull:{addressDetails:{_id:addressId}}
                }
            )
            res.redirect('/savedAddress')
        } catch (error) {
            res.render('user/500');
        }
    }else{
        res.redirect('/userLogin');
    }
  }

  const getAbout = (req,res)=>{
    try{
    const session = req.session.consumer;
                if(session){
                    customer = true;
                } else{
                    customer = false;
                }
        res.render('user/about');
  }catch(error){
    res.render('user/500');
  }
}




















module.exports = {  getHomeN,getUserLogin,getRegister,postRegister,postLogin,
                    getLogout,getShop,getHome,getProductView,getCategory,getOtp,
                    postOtp,getCart,viewCart,removeProduct,changeQuantity,totalAmount,
                    getCheckOutPage,addNewAddress,placeOrder,orderConfirmation,
                    addToWishlist,viewWishlist,removeFromWishlist,getOrders,cancelOrder,
                    viewOrderProducts,userProfile,editAccount,postEditAccount,changePassword,
                    changePasswordPost,verifyPayment,paymentFail,getSavedAddress,postEditAddress,
                    deleteAddress,returnProduct,couponCheck,getAbout};