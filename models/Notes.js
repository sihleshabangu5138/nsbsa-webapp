const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
  note: [String],
  fileattach: [String],
  module: String,
  module_id: mongoose.Schema.Types.ObjectId,
});

const Notes = mongoose.model('notes', notesSchema,'notes');

module.exports = Notes;
