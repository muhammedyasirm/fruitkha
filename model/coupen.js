const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');
const ObjectId = Schema.ObjectId;
const couponSchema = new Schema(
    {
        coupon_code: {
            type: String,
            required: true
        },
        offer: {
            type: Number,
            required: true
        },
        max_amount: {
            type: Number,
            required: true
        },
        startDate: {
            type: {
                type: String,
                default:
                    moment().format("DD/MM/YYYY") + ";" + moment().format("hh:mm:ss"),
            },
        },
        expirationTime: {
            type: String,
            required: true
        },
        coupon_status: {
            type: Boolean,
            default: false
        },
        used_user_id:[String]
        },
    {
        timestamps: true
    }
);

const coupon = mongoose.model('coupon', couponSchema);
module.exports = coupon;