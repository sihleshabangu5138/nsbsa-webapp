const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstname: String,
  middlename: String,
  lastname: String,
  email: String,
  photo: String,
  ccode: String,
  mobile: String,
  occupation: String,
  birthdate: { type: Date, default: Date.now },
  gender: String,
  username: String,
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'roles', // Reference to the Role model (assuming you have a Role model)
  },
  password: String,
  address: String,
  country: Number,
  state: Number,
  city: Number,
  pincode: String,
  accountnumber: String,
  pannumber: String,
  status: Number,
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  },
  updatedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', 
  }
});

const Users = mongoose.model('Users', userSchema, 'users');

module.exports = Users;
