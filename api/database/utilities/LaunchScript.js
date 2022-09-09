module.exports = {
  LaunchScript : {
    id: Number,
    name: String,
    executableName: String,
    startArgs: String,
    stopArgs: String,
    variables: Array,
    startTokens: Array,
    stopTokens: Array,
    finde: function() {
      const DATA_PATH = "../data/";
      const LAUNCHSCRIPT_PATH = DATA_PATH + "launchscript.json";
      const launchScriptData = require(LAUNCHSCRIPT_PATH);
      if (!launchScriptData) {
        console.log("non");
        return null;
      }
      var Scripts = [];
      for (let i = 0; i < launchScriptData.length; i++) {
        Scripts.push(launchScriptData[i]);
      }
      return Scripts;
    }
  }
};
