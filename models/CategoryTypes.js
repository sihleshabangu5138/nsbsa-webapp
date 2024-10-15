const mongoose = require('mongoose');

const categoryTypeSchema = new mongoose.Schema({
  category_type: String,
});

const CategoryType = mongoose.model('categorytypes', categoryTypeSchema,'categorytypes');

module.exports = CategoryType;