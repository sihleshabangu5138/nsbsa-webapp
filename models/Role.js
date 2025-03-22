const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  role_nm: String,
  role_slug: String,
  role_desc: String,
  admin_access: Number,
  allow_access: Number,
  status: Number,
});

const Role = mongoose.model('Role', roleSchema,'roles');

module.exports = Role;
