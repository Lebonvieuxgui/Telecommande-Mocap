const fs = require("fs");
const update = require("./updateFile.js");
const oldFilenames = require("../data/execs.json");

module.exports = {
  loadExecs: function (path) {
    let newFilenames = fs.readdirSync(path);
    let newExecs = [];
    for (let name in newFilenames) {
      newExecs.push({ name: newFilenames[name], id: name });
    }
    update.updateFile(newExecs, "./database/data/execs.json");
  },
};
