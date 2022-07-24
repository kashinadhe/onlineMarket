const mongoose=require("mongoose");

const productSchema=new mongoose.Schema({
    name: String,
    price: {type: Number, required: true}, /*Mongoose Validation*/
    productImage: String
});

const Product=mongoose.model("Product",productSchema);
module.exports=Product;