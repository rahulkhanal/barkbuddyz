const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
    {
        firstname: { 
            type: String, required: true },
        lastname: { 
            type: String, required: true },
        username: { 
            type: String, required: true, unique: true },
        email: { 
            type: String, required: true, unique: true },
        password: { 
            type: String,
            required: [true, "Please Enter Your Password"],
            minLength: [8, "Password should be greater than 8 characters"] 
        },
        isAdmin: { 
            type: Boolean, 
            default: false },
        
    },
    { timestamps: true},  // print the current time when the user is created
    {resetPasswordToken: String},
    {resetPasswordExpires: Date}
);


// Generating Password Reset Token
UserSchema.methods.getResetPasswordToken = function () {
    // Generating Token
    const resetToken = crypto.randomBytes(20).toString("hex");
  
    // Hashing and adding resetPasswordToken to userSchema
    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
  
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  
    return resetToken;
  };
  

module.exports = mongoose.model("User" , UserSchema );