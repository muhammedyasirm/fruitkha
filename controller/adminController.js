const express = require('express');

const body = require('body-parser');

const mongoose = require('mongoose');

const adminRoute = require('../userRoute/adminRoute');

const session = require('express-session');
const userModel = require('../model/userModel');
const products = require('../model/productModel');
const categories = require('../model/categoryModel');
const { find } = require('../model/userModel');

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
        // console.log(categoryId)
        const image = req.files.product_image;
        const Product = new products({
            product_name: req.body.product_name,
            price: req.body.price, 
            category: categoryId,
            description: req.body.description,
            stock: req.body.stock
        })
        const productDetails = await Product.save();
        if(productDetails){
            let productId = productDetails._id;
            image.mv('./public/images/'+productId+'.jpg',(err)=>{
                if(!err){
                    res.redirect('/productdetails')
                } else {
                    console.log(err);
                }
            })
        }
        
    } catch (error) {
        console.log(error.message);
    }

}

const getProductDetails = async (req,res)=> {
    let session = req.session.admin;
    if(session){
        let product = await products.find().populate('category')
        //console.log(product);
        res.render('admin/productDetails',{product});
    } else {
        res.redirect('/adminLogin');
    }
}

const editProduct = async(req,res)=>{
    const id = req.params.id;
    const category = await categories.find();
    const productData = await products.findOne({_id:id});
    res.render('admin/editProduct',{productData,category})
}

const postEditProduct = async(req,res) => {
   // console.log(req.body.category);
    const id = req.params.id;
    //console.log(id);
    //console.log(req.body.category);
    //let category = mongoose.Types.ObjectId(id)
    //console.log("id",category);
    await products.updateOne({_id:id},{$set:{
        product_name: req.body.product_name,
        price: req.body.price,
        category: req.body.category,
        description: req.body.description,
        sotck:req.body.stock
    }});
    if(req?.files?.product_image){
        const image = req.files.product_image;
        image.mv('./public/images/'+id+'.jpg',(err)=>{
            if(!err){
                res.redirect('/productdetails');
            } else {
                console.log(err);
            }
        })
    } else {
        res.redirect('/productdetails');
    }
}

const getDelete = async (req,res) =>{
    const id = req.params.id;
    await products.deleteOne({_id:id}).then(()=>{
        res.redirect('/productdetails');
    })
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













module.exports = {  getAdminLogin,postAdminLogin,getDashboard,getUserDetails,blockUser,
                    unblockUser,getLogout,addproducts,postAddProduct,getProductDetails,
                    editProduct,postEditProduct,getDelete,getCategory,addCategory,editCategory,
                    deleteCategory}