const express = require('express');

const body = require('body-parser');

const mongoose = require('mongoose');

const adminRoute = require('../userRoute/adminRoute');

const order = require('../model/order');

const moment = require('moment');
moment().format();


const session = require('express-session');
const userModel = require('../model/userModel');
const products = require('../model/productModel');
const categories = require('../model/categoryModel');
const { find } = require('../model/userModel');
const multer = require('multer')
const { cloudinary } = require('../cloudinary');
const cart = require('../model/cartModel');
const { response } = require('../userRoute/adminRoute');

const getDashboard = (req,res)=>{
    let session = req.session.admin;
    if(session){
        res.render('admin/dashboard');
    } else {
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
                    phonenumber:1
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
        console.log("Product details order   = ",productData);
        res.render('admin/orderDetails',{productData});
    } catch(error){
        console.log(error);
    }
}

const orderStatusChange = async(req,res)=>{
    try {
        const id = req.params.id;
        const data = req.body;
        await order.updateOne({_id:id},
            {
                $set:{
                    orderStatus:data.orderStatus,
                    paymentStatus:data.paymentStatus
                }
            })
            res.redirect('/order');
    } catch (error) {
        console.log(error);
    }
}












module.exports = {  getAdminLogin,postAdminLogin,getDashboard,getUserDetails,blockUser,
                    unblockUser,getLogout,addproducts,postAddProduct,getProductDetails,
                    editProduct,postEditProduct,getDelete,getCategory,addCategory,editCategory,
                    deleteCategory,getRestore,getOrders,orderDetails,orderStatusChange}