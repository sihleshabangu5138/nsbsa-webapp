const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productname: String,
  categorytypes: String,
  productunit: String,
  description: String,
  productimage: [String], // Assuming an array of image URLs
  warranty: String,
  dur_type: String,
  tagname: [String], // Assuming an array of tag names
  skubarcode: String,
  initialstock: String, // Assuming stock quantity is a String
  stockexpiry: String, // Assuming stock expiry is a Str
  locationrack: String,
  retailprice: String, // Assuming prices are Strings
  specialprice: String,
  supplyprice: String,
  commission: String,
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  }
});

const Product = mongoose.model('product', productSchema,'products');

module.exports = Product;
