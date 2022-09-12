var mongoose = require("mongoose");

var ProjectSchema = new mongoose.Schema({
  name: String,
  currentIndex: Number,
  current: Boolean
});

mongoose.model("Project", ProjectSchema);

module.exports = mongoose.model("Project");
