const mongoose = require('mongoose');

const notificationTemplateSchema = new mongoose.Schema({
  notificationtype: String,
  slug: String,
  templatetitle: String,
  subject: String,
  content: String,
  addedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  }
});

  const NotificationTemplate = mongoose.model('notificationtemplate', notificationTemplateSchema,'notificationtemplates');

module.exports = NotificationTemplate;