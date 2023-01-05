const express = require('express');

const body = require('body-parser');

const mongoose = require('mongoose');

const adminRoute = require('../userRoute/adminRoute');

const order = require('../model/order');

const coupon = require('../model/coupen');

const moment = require('moment');
moment().format();
require('fs');
const path = require('path');
const excelJs = require('exceljs')



const session = require('express-session');
const userModel = require('../model/userModel');
const products = require('../model/productModel');
const categories = require('../model/categoryModel');
const { find, aggregate } = require('../model/userModel');
const multer = require('multer')
const { cloudinary } = require('../cloudinary');
const cart = require('../model/cartModel');
const { response } = require('../userRoute/adminRoute');

const getDashboard = async(req,res)=>{
    let session = req.session.admin;
    if(session){
        try {
            const orderData = await order.find({orderStatus:{$ne:"Cancelled"}});
            const totalRev = orderData.reduce((accumulator,object)=>{
                return(accumulator+=object.discountAmount);
            },0);

            const todayOrder = await order.find({orderStatus:{$ne:"Cancelled"},
        orderDate:moment().format("MMM Do YY")});

        const todayRev = todayOrder.reduce((accumulator,object)=>{
            return (accumulator+=object.discountAmount);
        },0);

        const start = moment().startOf("month");
        const end = moment().endOf("month");
        const monthOrder = await order.find({
            orderStatus:{$ne:"Cancelled"},
            createdAt:{
                $gte:start,
                $lte:end
            }
        });
        console.log("Dashboard Month order  =  ",monthOrder);
        const monthRev = monthOrder.reduce((accumulator,object)=>{
            return(accumulator+=object.discountAmount)
        },0);
        console.log("Dashboard Month Revenue  =  ",monthRev);

        const placed = await order.find({orderStatus:"Placed"});
        const shipped = await order.find({orderStatus:"Shipped"});
        const delivered = await order.find({orderStatus:"Delivered"});
        const cancelled = await order.find({orderStatus:"Cancelled"});
        const returned = await order.find({orderStatus:"Return Approved"});

        const placedOrder = placed.length;
        const shippedOrder = shipped.length;
        const deliveredOrder = delivered.length;
        const cancelledOrder = cancelled.length;
        const returnedOrder = returned.length;

        const cod = await order.find({paymentMethod:"cod"});
        const online = await order.find({paymentMethod:"online"});

        const codOrder = cod.length;
        const onlineOrder = online.length;
            res.render('admin/dashboard',{
                totalRevenue : Math.ceil(totalRev),
        todayRevenue : Math.ceil(todayRev),
        monthRevenue : Math.ceil(monthRev),
        placedOrder,
        shippedOrder,
        deliveredOrder,
        cancelledOrder,
        onlineOrder,
        codOrder,
        returnedOrder
            });  
        } catch (error) {
           console.log(error) 
        }
    } else {
        res.redirect('/adminLogin')
    }
}

const getSales = (req,res)=>{
    if(req.session.admin){
        try {
            let date = 0
         order.find({orderStatus:"Delivered"}).then((orderData)=>{
            res.render('admin/sales',{orderData,date});
         });
        } catch (error) {
           console.log(error); 
        }
    }else{
        res.redirect('/adminLogin')
    }
}

const salesfilter = (req,res)=>{
    if(req.session.admin){
        try {
            let date = req.body;
            order.find({
                orderStatus:"Delivered",
                createdAt:{$gte:date.from,$lte:date.to}
            }).then((orderData)=>{
                if(orderData){
                    res.render("admin/sales",{orderData,date});
                }else{
                    res.redirect("/sales");
                }
            })
        } catch (error) {
          console.log(error);  
        }
    } else{
        res.redirect('/adminLogin')
    }
}

const downsales = async(req,res)=>{
    if(req.session.admin){
        try {
            let date = req.body;
            if(date.from){
                let orderData = await order.find({
                    orderStatus:"Delivered",
                    createdAt:{$gte:date.from,$lte:date.to}
                });
                const workbook = new excelJs.Workbook();
                const worksheet = workbook.addWorksheet("My Sheet");
                worksheet.columns = [
                    {header:"OrderId",key:"OrderId",width:30},
                    { header: "Customer", key: "Customer", width: 15 },
                    { header: "Amount", key: "Amount", width: 15 },
                    { header: "Status", key: "Status", width: 15 }
                ];

                orderData.forEach((orderData)=>{
                    worksheet.addRow({
                        OrderId:orderData._id,
                        Customer:orderData.name,
                        Amount:orderData.discountAmount,
                        Status:orderData.orderStatus
                    });
                });
                await workbook.xlsx.writeFile("order.xlsx").then((data) => {
                    const location = path.join(__dirname + "../../order.xlsx");
                    res.download(location);
                  });
            }else{
                let orderData = await order.find({orderStatus:"Delivered"});

                const workbook = new excelJs.Workbook();
                const worksheet = workbook.addWorksheet("My sheet");

                worksheet.columns = [
                    { header: "OrderId", key: "OrderId", width: 30 },
                    { header: "Customer", key: "Customer", width: 15 },
                    { header: "Amount", key: "Amount", width: 15 },
                    { header: "Status", key: "Status", width: 15 },
                  ];

                  orderData.forEach((order)=>{
                    worksheet.addRow({
                        OrderId:order._id,
                        Customer:order.name,
                        Amount:order.discountAmount,
                        Status:order.orderStatus
                    })
                  })

                  await workbook.xlsx.writeFile("order.xlsx").then((data) => {
                    const location = path.join(__dirname + "../../order.xlsx");
                    res.download(location);
                  });
            }
        } catch (error) {
           console.log(error); 
        }
    }else{
        res.redirect('/adminLogin') 
    }
}

const getAdminLogin = (req,res)=>{

    let session = req.session.admin;
    if(session){
        res.redirect('/dashboard');
    } else {
        res.render('admin/adminLogin');
    }
}

const postAdminLogin = (req,res)=>{
    const admin = {Email: "admin@gmail.com", Password: "admin123"};
    const {Email, Password} = req.body;

    try{
        if(Email == admin.Email && Password == admin.Password) {
            
            req.session.admin = req.body.Email;
            res.redirect('/dashboard');
        }else{
            res.send("Inavlid user or Password")
        }
    } catch (error){
        console.log(error);
        res.status(500).send(error)
    }
}

const getUserDetails = async (req,res) => {
    let session = req.session.admin;
    if(session){
        users = await userModel.find();
        res.render('admin/userDetails',{users});
        
    } else {
        res.render('admin/adminLogin');
    }
}

const blockUser = async (req,res) => {
    const id = req.params.id;
    await userModel.updateOne({_id:id},{$set:{Block:true}})
    res.redirect('/userDetails');
}

const unblockUser = async (req,res) => {
    const id = req.params.id;
    await userModel.updateOne({_id:id},{$set:{Block:false}})
    res.redirect('/userDetails');
}

const getLogout = (req,res) =>{
    try{
        req.session.destroy()
        res.redirect('/adminLogin')
    } catch (error) {
        console.log('error');
    }
}

const addproducts = async(req,res) =>{
    let session = req.session.admin;
    if(session){
         let category = await categories.find()
        res.render('admin/addProduct',{category});
    } else {
        res.redirect('/adminLogin')
    }
}

const postAddProduct = async(req,res)=>{
    //let session = req.session.consumer;
    try {
        let categoryId = req.body.category 
        //const image = req.files.product_image;
        const Product = new products({
            product_name: req.body.product_name,
            price: req.body.price, 
            category: categoryId,
            description: req.body.description,
            stock: req.body.stock
        }); 
        Product.image = req.files.map((f)=>({url:f.path, filename:f.filename}));
        console.log(req.files);
        console.log("product after map",Product);

        const productDetails = await Product.save();
        console.log(productDetails);
        res.redirect('/productdetails');
        // if(productDetails){
        //     let productId = productDetails._id;
        //     image.mv('./public/images/'+productId+'.jpg',(err)=>{
        //         if(!err){
        //             res.redirect('/productdetails')
        //         } else {
        //             console.log(err); 
        //         }
        //     })
        // }
        
    } catch (error) {
        console.log(error.message);
    }

}

const getProductDetails = async (req,res)=> {
    let session = req.session.admin;
    if(session){
        let product = await products.find().populate('category')
        console.log(product);
        res.render('admin/productDetails',{product});
    } else {
        res.redirect('/adminLogin');
    }
}

const editProduct = async(req,res)=>{
    const id = req.params.id;
    const category = await categories.find();
    const productData = await products.findOne({_id:id}).populate('category');
    res.render('admin/editProduct',{productData,category})
}

const postEditProduct = async(req,res) => {
    // console.log("edit req.Body",req.body);
    // console.log("edit req.file",req.files);
   const photos = req.files.map((f)=>({
    url:f.path,
    filename: f.filename,
   }));

   const {
    product_name,
    price,
    category,
    description,
    stock
   } = req.body;
  try {
    console.log('params = ',req.params);
    const product = await products.findByIdAndUpdate(req.params.id,{
        product_name,price,category,description,stock
    });
    console.log('productImage',product);
    console.log('photos= ',photos);
    product.image.push(...photos);
    product.save();
    res.redirect('/productdetails');
  } catch (error) {
    console.log(error);
  }
}

const getDelete =(req,res) =>{
    try{
        const id = req.params.id;
        console.log("DeleteId",id);
        const objId = mongoose.Types.ObjectId(id);
        products.updateOne({_id:id},{$set:{isDeleted:true}}).then(()=>{
            cart.updateMany(
                {"product.productId":objId},
                {$pull:{product:{productId:objId}}},
                {multi : true}
            ).then((data)=>{
                res.redirect('/productdetails');
            })
        })
    } catch(error){
        console.log(error);
    }
} 

const getRestore = (req,res)=>{
    try {
       const id = req.params.id;
       console.log("Restore",id);
       products.updateOne({_id:id},{$set:{isDeleted:false}}).then(()=>{
        res.redirect('/productdetails');
       })
       
    
}catch(error){
    console.log(error);
}
}

const getCategory = async(req,res)=>{
    let session = req.session.admin;
    if(session){
        const Category = await categories.find();
        res.render('admin/category',{Category});
    } else {
        res.redirect('/adminLogin');
    }
}

const addCategory = async (req,res) =>{
    const Category = new categories ({
        category_name: req.body.category_name
    });
    await Category.save();
    res.redirect('/category');
}

const editCategory = async (req,res) =>{
    const id = req.params.id;
    await categories.updateOne({_id:id},{$set:{
        category_name:req.body.category_name
    }});
    res.redirect('/category');
}

const deleteCategory = async(req,res)=>{
    const id = req.params.id;
    await categories.deleteOne({_id:id});
    res.redirect('/category');
}

const getOrders = async(req,res)=>{
    order.aggregate([
        {
            $lookup:{
                from:'products',
                localField:'orderItems.productId',
                foreignField:'_id',
                as:'product',
            }
        },
        {
            $lookup:{
                from:'user',
                localField:'userId',
                foreignField:'_id',
                as:'users'
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        }
    ]).then((orderDetails)=>{
        console.log("Get order  = ",orderDetails);
        res.render('admin/order',{orderDetails});
    })
}

const orderDetails = async(req,res)=>{
    try{
        const id = req.params.id;
        const objId = mongoose.Types.ObjectId(id);
        const productData = await order.aggregate([
            {
                $match:{_id:objId}
            },
            {
                $unwind:"$orderItems"
            },
            {
                $project:{
                    productItem:"$orderItems.productId",
                    productQuantity:"$orderItems.quantity",
                    address:1,
                    name:1,
                    phonenumber:1,
                    discount:1,
                    discountAmount:1,
                    totalAmount:1
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
                    productQuantity:1,
                    address:1,
                    name:1,
                    phonenumber:1,
                    discount:1,
                    discountAmount:1,
                    totalAmount:1,
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
        ]);
        console.log("Product details order admin   = ",productData);
        res.render('admin/orderDetails',{productData});
    } catch(error){
        console.log(error);
    }
}

const orderStatusChange = async(req,res)=>{
    try {
        const id = req.params.id;
        const data = req.body;
        // console.log("Admin data in status change  =  ",data);
        // console.log("Admin id in status change  =  ",id);
        
            const objId = mongoose.Types.ObjectId(id);
            const fullOrder = await order.findOne({_id:id});
            console.log("Full order detail amount:  ",fullOrder.totalAmount);
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

            const userData = await order.aggregate([
                {
                    $match:{_id:objId}
                },
                {
                    $project:{
                        user:"$userId"
                    }
                },
                {
                    $lookup:{
                        from:"users",
                        localField:"user",
                        foreignField:"_id",
                        as:"userDetail"
                    }
                },
                {
                    $unwind:"$userDetail"
                }
            ])
            await order.updateOne({_id:id},
                {
                    $set:{
                        orderStatus:data.orderStatus,
                        paymentStatus:data.paymentStatus
                    }
                })
                const orderDetail = await order.findOne({_id:id});
            if(orderDetail.orderStatus==="Return Approved"){
                         userModel.updateOne({_id:userData[0].user},{$inc:{Wallet:fullOrder.discountAmount}}).then((data)=>{
                            console.log(data);
                         });
                 }
             console.log("Order DETAIL in admin  =  ",orderData)
            console.log("USerData in return admin  =  ",userData);
        } catch (error) {
            console.log(error);
        }
             res.redirect('/order');
    }

const getCouponPage = async(req,res) =>{
    try {
        const couponData = await coupon.find();
        res.render('admin/coupon',{couponData})
    } catch (error) {
       console.log(error); 
    }
}

const addCoupon = (req,res)=>{
    try {
        const data = req.body;
        const dis = parseInt(data.discount);
        const maxLimit = parseInt(data.maxLimit);
        const discount = dis;

        coupon.create({
            coupon_code:data.couponName,
            offer:discount,
            max_amount:maxLimit,
            expirationTime:data.expirationTime
        }).then((data)=>{
            console.log(data);
            res.redirect('/coupon');
        })
    } catch (error) {
       console.log(error); 
    }
}

const deleteCoupon = async(req,res)=>{
    try {
        const id = req.params.id;
        await coupon.updateOne({_id:id},{$set:{delete:true}})
        res.redirect('/coupon');
    } catch (error) {
        console.log(error);
    }
}

const restoreCoupon = async(req,res)=>{
    try {
        const id = req.params.id;
        await coupon.updateOne({_id:id},{$set:{delete:false}});
        res.redirect('/coupon');
    } catch (error) {
        console.log(error);
    }
}















module.exports = {  getAdminLogin,postAdminLogin,getDashboard,getUserDetails,blockUser,
                    unblockUser,getLogout,addproducts,postAddProduct,getProductDetails,
                    editProduct,postEditProduct,getDelete,getCategory,addCategory,editCategory,
                    deleteCategory,getRestore,getOrders,orderDetails,orderStatusChange,
                    getCouponPage,addCoupon,deleteCoupon,restoreCoupon,getSales,salesfilter,
                downsales}