const express = require("express");
const router = express.Router(); /*router is a sub-package which has 
                                the capabilities to conviniently handle different routes, 
                                to reach different endpoints with different HTTP words*/
const Product = require("../models/product");
const mongoose = require("mongoose");
const checkAuth = require("../middleware/check-auth");

/*MULTER is an npm package that makes it easy to handle file uploads.*/
const multer = require("multer"); /*Very efficient as compared to body-parser*/

const storage = multer.diskStorage({
  /*The disk storage engine gives you 
                                    full control on storing files to disk.*/
  destination: (req, file, cb) => {
    /*cb is a callback function*/
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    /*filename key specifies what 
                                    name format the file should be saved*/
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  /*Filtering files*/
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true); /*If file type is jpeg or png then make call equal to true*/
  } else {
    cb(null, false);
    console.log("Upload only jpeg or png files");
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10 /*accepting file of max size 10 MB*/,
  },
  fileFilter: fileFilter,
}); /*all incoming files are stored in uploads folder*/

/*Using Router() to register different routes*/
router.get("/", (req, res, next) => {
  Product.find()
    .select("name price productImage")
    .then((docs) => {
      const response = {
        count: docs.length,
        products: docs.map((doc) => {
          return {
            _id: doc._id,
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage,
          };
        }),
      };
      res.status(200).json(response);
    });
}); /*Here we won't write /products because the 
    /products route has been already forwarded to this file from app.js*/

/*Displaying product details*/
router.get("/:productId", (req, res, next) => {
  /*/:<express routing parameter>*/
  const id = req.params.productId;
  Product.findOne({ _id: id })
    .then((result) => {
      if (result) {
        res.status(200).json({
          name: result.name,
          price: result.price,
        });
      } else {
        res.status(404).json({ message: "Id does not exists!" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

/*Inserting new product to the products collection*/
/*upload.single() parses only 1 incoming file*/
/*checkAuth is a middleware which checks whether the user is signed in and then that user will be able to make post request to the products route*/
router.post("/", checkAuth, upload.single("productImage"), (req, res, next) => {
  console.log(req.file); /*New request object 'file' 
                            that is available due to 
                            upload.single() middleware*/
  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    productImage:
      req.file.path /*Storing incoming file path into Product collection*/,
  });
  product.save();
  res.status(200).json({
    message: "handling POST request",
    createdProduct: product,
  });
});

/*Updating product details*/
router.patch("/:productId", checkAuth, (req, res, next) => {
  const id = req.params.productId;
  const newPrice = req.body.newPrice;
  Product.updateOne({ _id: id }, { price: newPrice })
    .then(() => {
      res.status(200).json({
        message: "Product price UPDATED",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

/*Deleting products*/
router.delete("/:productId", checkAuth, (req, res, next) => {
  const id = req.params.productId;
  Product.deleteOne({ _id: id })
    .then(() => {
      res.status(200).json({ message: "Product DELETED" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
