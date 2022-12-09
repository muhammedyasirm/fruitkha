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