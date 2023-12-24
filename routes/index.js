const express = require("express");
const User = require("../models");
const bcrypt = require("bcryptjs");
const generatetoken = require("../utils");
const verifytoken = require("../middleware");
const router = express.Router();
const nodemailer = require("nodemailer");

router.get("/test", (req, res) => {
  res.json({ message: "test message" });
});

//posting data
router.post("/user", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      const hashedpassword = await bcrypt.hash(password, 10);

      const newuser = new User({ email, password: hashedpassword });
      await newuser.save();

      return res.status(201).json({ message: "user created succesfully" });
    } else {
      res.status(400).json({ message: "User already exists" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error in adding details" });
  }
});

//authenticating posted data

router.post("/authenticate", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "user not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ message: "Invalid password" });
    }

    const token = generatetoken(user);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Authendtication failed" });
  }
});

//verified token
router.get("/data", verifytoken, (req, res) => {
  res.json({
    message: `welcome , ${req.user.email} !  this is protected data`,
  });
});

//reset password mail

router.post("/reset-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const token = Math.random().toString(36).slice(-8);
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; //1hour

    await user.save();

    //using nodemailer

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "learningsformyself123@gmail.com",
        pass: "cahqamxwtjgurbca",
      },
    });

    //sending procedure
    const message = {
      from: "learningsformyself123@gmail.com",
      to: user.email,
      subject: "Password reset",
      text: `Reset password for your Account \n\n Please use the following token to reset your password : ${token} \n\n If you are not please ignore this email`,
    };

    transporter.sendMail(message, (err, info) => {
      if (err) {
        res.status(404).json({ message: "something went wrong" });
      }

      res
        .status(201)
        .json({ message: "Email sent succesfully" + info.response });
    });
  } catch (error) {
    res.status(500).json({ message: "error in catch block" });
  }
});


//posting token to reset the password

router.post("/reset-password/:token", async (req,res) => {
    try {
        const {token} = req.params;
        const {password} = req.body;
        
        const user = await User.findOne({
            resetPasswordToken:token,
            resetPasswordExpires:{$gt: Date.now()}
        })

        if(!user){
            return res.status(404).json({message:"invalid token"});
        }

        const hashedpassword = await bcrypt.hash(password, 10);
        user.password= hashedpassword,
        user.resetPasswordToken = null,
        user.resetPasswordExpires = null

        await user.save();

        res.json({message:"Password reset succesfully"})
    } catch (error) {
        res.status(500).json({message:"error in reseting password"});
    }
})

//exporting the router
module.exports = router;
