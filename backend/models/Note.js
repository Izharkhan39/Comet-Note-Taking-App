// backend/models/Note.js
const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  data: { type: Object, required: true }, // Stores Editor.js JSON data
  imageUrl: { type: String }, // URL of the uploaded image (optional)
  category: { type: String, default: "private" }, // Note category
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Note", NoteSchema);
