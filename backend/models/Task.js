const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  description: String,
  reminder: Boolean,
});

module.exports = mongoose.model("Task", taskSchema);
