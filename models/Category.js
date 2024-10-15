const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  categorytypes: String,
  categoryname: String,
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  }
});

const Category = mongoose.model('category', categorySchema,'categories');

module.exports = Category;
