var mongoose = require("mongoose");

var LaunchScriptSchema = new mongoose.Schema({
  name: String,
  executableName: String,
  startArguments: String,
  stopArguments: String,
  variables: Array,
  startTokens: Array,
  stopTokens: Array
});

mongoose.model("LaunchScript", LaunchScriptSchema);

module.exports = mongoose.model("LaunchScript");
