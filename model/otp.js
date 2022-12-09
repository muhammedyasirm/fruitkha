const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    otp:{
        type: Number,
        required: true
    },
    userId :{
        type: mongoose.SchemaTypes.ObjectId
    }
})

const otp = mongoose.model('otp',otpSchema);
module.exports = otp;