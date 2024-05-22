const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    
    desc: { type: String, required: true },

    price: { type: Number, required: true },

    category: { type: String, required: true ,
        enum: ["pets", "food", "essentials", "hygiene"]
    },

    color: { type: Array },

    size: { type: Array },
    
    // type: { type: String},
    
    img: { type: String, required: true },
    
    stocks: { type: Number, required: true },
    
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Product", ProductSchema);