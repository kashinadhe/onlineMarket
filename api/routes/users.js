const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../Keys");

const User = require("../models/user");
const checkAuth = require("../middleware/check-auth");

router.post("/signup", (req, res, next) => {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (user === null) {
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        /*bcrypt hash() encrypts 
                                                        the password field by 
                                                        converting the plain text 
                                                        into mixed characters and symbols*/
        if (err) {
          console.log(err);
          return res.status(500).json({
            error: err,
          });
        } else {
          const user = new User({
            email: req.body.email,
            password: hash,
          });
          user
            .save()
            .then(() => {
              res.status(201).json({
                message: "New User Created",
              });
            })
            .catch((err) => {
              res.status(500).json({
                error: err,
              });
            });
        }
      });
    } else {
      res.status(500).json({
        message: "Email already exists",
      });
    }
  });
});

router.post("/signin", (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email }, function (err, user) {
    if (user === null) {
      res.status(500).json({
        message: "Email does not exists",
      });
    } else {
      /*We cannot decrypt the encrypted password so we use bcrypt's compare() function*/
      bcrypt.compare(password, user.password, (err, result) => {
        /*the compare() function 
                                                                encrypts the input password 
                                                                using hash algorithm and 
                                                                compares it with the stored 
                                                                encrypted password and 
                                                                returns a boolean 'result' 
                                                                value*/
        if (result) {
          const token = jwt.sign(
            {
              email: user.email,
              userId: user._id,
            },
            JWT_SECRET,
            {
              expiresIn: "1h",
            }
          );
          res.status(200).json({
            message: "Welcome " + user.email,
            token: token,
          });
        } else {
          res.status(401).json({
            message: "Incorrect Password",
          });
        }
      });
    }
  });
});

router.delete("/:userId", checkAuth, (req, res, next) => {
  User.deleteOne({ _id: req.params.userId }).then((deletedUser) => {
    res.status(200).json({
      message: "User has been successfully deleted",
    });
  });
});

module.exports = router;
