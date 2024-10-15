const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    dbConnect: String,
    installation: String,
    pkey: String,
});
const Setting = mongoose.model('settings', settingSchema, 'settings');

module.exports = Setting;