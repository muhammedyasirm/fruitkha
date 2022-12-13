const express = require('express');
const app = express();
const path=require('path');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/fruits');
const db = mongoose.connection;
db.on('error',console.log.bind(console,"connection error"));
db.once('open',function(callback){
    console.log("connection success");
});

const session = require('express-session');
const cookieParser = require('cookie-parser');

const userRoute = require('./userRoute/userRoute');
const adminRoute = require('./userRoute/adminRoute');

app.set("views");
//app.use(express.static("views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,'public')))

app.use(session({
    name : "session-1",
    secret : "Secret",
    saveUninitialized : false,
    resave : false
})
);

app.use(cookieParser());

app.use(function(req,res,next){
    res.set(
        "Cache-Control",
        "no-cache, private,no-store, must-revalidate,max-stale-0, post-check=0, pre-check=0"
    )
    next();
}
)

app.use(express.json());

app.use(express.urlencoded({extended:true}));

app.use('/',userRoute);

app.use('/',adminRoute);










app.listen(4000,()=>console.log('server started'));
