const Razorpay = require("razorpay");
const dotenv = require("dotenv");
dotenv.config();

const instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.SECRET,
});

module.exports = instance;