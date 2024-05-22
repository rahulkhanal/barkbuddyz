const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
// const bcrypt = require('bcrypt');

const Token = require("../utils/token");
const e = require("express");

//SIGN UP/ register
router.post("/register", async (req, res) => {
  console.log(req.body);
  const newUser = new User({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SECRET
    ).toString(),
    // isAdmin: true
  });

  try {
    // CHECK EMAIL
    const username = await User.findOne({ username: req.body.username });
    if (username) {
      return res.status(401).json("The username you provided is taken");
    }
    // CREATE USER
    const savedUser = await newUser.save();

    // SIGN TOKEN
    const accessToken = jwt.sign(
      {
        id: savedUser._id,
        isAdmin: savedUser.isAdmin
      },
      process.env.JWT_KEY,
      { expiresIn: "3d" }
    );

    // SEND RESPONSE
    const { password, ...userData } = savedUser._doc;
    return res.status(201).json({ accessToken, ...userData });
  }

  catch {
    res.status(500).json("Email is already taken");
    // console.log(err);
  }
});

//SIGN IN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.body.username,
    });

    if (!user) return res.status(401).json("Incorrect username");

    const encryptedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.SECRET
    );

    const originalPassword = encryptedPassword.toString(CryptoJS.enc.Utf8);

    const inputPassword = req.body.password;

    if (originalPassword !== inputPassword)
      return res.status(401).json("Incorrect password");

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_KEY,
      { expiresIn: "3d" }
    );

    const { password, ...userData } = user._doc;
    res.status(200).json({ ...userData, accessToken });
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGOUT

// router.post("/logout", (req, res) => {

//   req.logout();
//   res.redirect('/login');
// });

router.post("/logout", (req, res) => {

  req.session.destroy()
  req.logout()
  res.redirect('/login');
});


//  FORGET PASSWORD

router.post("/forget", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email
    });

    if (!user) return res.status(404).json("User not found");


    // Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then, please ignore it.`;

    try {
      await sendEmail({
        email: user.email,
        subject: `Ecommerce Password Recovery`,
        message,
      });

      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email} successfully`,
      });
    }
    catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      res.status(500).json(err);
    }
  }
  catch (err) {
    res.status(500).json(err);
  }
});

//  RESET PASSWORD TOKEN

router.put("/reset/:token", async (req, res) => {

  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json("Reset Password Token is invalid or has been expired");

    if (req.body.password !== req.body.confirmPassword)
      return res.status(400).json("Input correct credentials.");


    // user.password = req.body.password;

    user.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SECRET).toString();

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user);
    res.status(500).json(err);
  }
  catch {
    // res.status(500).json(err);
    res.status(200).json({
      success: true,
      message: `Password changed successfully`,
    });
  }
});

module.exports = router;