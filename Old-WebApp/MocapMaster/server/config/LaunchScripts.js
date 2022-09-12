const LaunchScriptHelper = require("../helpers/LaunchScriptHelper");

let state = require("../state");

try {
  state.scripts = LaunchScriptHelper.DetectScripts();
} catch (error) {
  state.scripts = [];
}
