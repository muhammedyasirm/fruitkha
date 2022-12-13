const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    url:String,
    filename:String
});

// ImageSchema.virtual("thumbnail").get(function(){
//     return this.url.replace("/upload","/upload/w_100/");
// });

// const opts = { toJSON:{virtuals: true}};

const productSchema = new mongoose.Schema({

    product_name: {
        type : String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'categories'
    },
    description: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    image:[
        {
            url : String,
            filename : String
        }
    ]
});

const products = mongoose.model('products' , productSchema);
module.exports = products;