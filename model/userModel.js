const mongoose = require('mongoose');
 const validator = require('mongoose-unique-validator');

 const userSchema = new mongoose.Schema({


    Fullname: {
        type: String,
        required: true,
        trim: true
    },
    Email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    Phonenumber: {
        type: Number,
        required: true,
        trim: true,
        unique: true
    },
    addressDetails: [
        {
            apartment : {
                type : String
            },
            area : {
                type : String
            },
            landmark: {
                type:String
            },
            district: {
                type:String
            },
            postoffice:{
                type:String
            },
            state:{
                type:String
            },
            pin:{
                type:String
            }
        }
    ],
    Password: {
        type: String,
        required: true,
        trim:true
    },
    Block:{
        type:Boolean,
        default:false
    },
    isActive:{
        type:Boolean,
        default:false
    }

 })
 const user = mongoose.model('user',userSchema)
 module.exports = user;