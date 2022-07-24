const mongoose=require("mongoose");
const Product=require("./product");
const orderSchema=new mongoose.Schema({
    product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
    quantity: {type: Number, default: 1}
});

const Order=mongoose.model("Order",orderSchema);

module.exports=Order;