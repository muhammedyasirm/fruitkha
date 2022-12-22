const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const orderSchema = new Schema(
    {
        userId:{
            type:ObjectId,
            required:true
        },
        name: {
            type:String,
            required:true
        },
        phonenumber:{
            type:String,
            required:true
        },
        address:{
            type:String,
            required:true
        },
        orderItems:[
            {
                productId:{
                    type:ObjectId,
                    required:true
                },
                quantity:{
                    type:Number,
                    require:true
                }
            }
        ],
        totalAmount:{
            type:Number,
            required:true
        },
        orderStatus:{
            type:String,
            default:"Placed"
        },
        paymentMethod:{
            type:String,
            required:true
        },
        paymentStatus:{
            type:String,
            default:"Not Paid"
        },
        orderDate:{
            type:String
        },
        deliveryDate:{
            type:String
        },
    },
    {
        timestamps:true
    }
);


const order = mongoose.model("order",orderSchema);
module.exports = order;