const mongoose = require('mongoose');


//creating user schema
const UserSchema = new mongoose.Schema({
    email:String,
    password:String,
    resetPasswordToken:String,
    resetPasswordExpires:Date
})

//creating user model
const User = mongoose.model("User" ,UserSchema)

module.exports = User;