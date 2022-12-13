const express = require('express')
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
cloudinary.config({
    cloud_name:'dzfg0qqab',
    api_key:'314878779949854',
    api_secret:'bks9eGw26M0xG7etLs4ouDf_oHU'
})

const storage = new CloudinaryStorage({
    cloudinary,
    params:{
        folder:"fruitkha",
        allowedFormats:['jpeg','png','jpg']
    }
});
module.exports = {
    cloudinary,storage
};