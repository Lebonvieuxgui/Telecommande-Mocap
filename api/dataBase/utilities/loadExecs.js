const fs = require('fs');
const update = require("./updateFile.js");
const oldFilenames = require("../data/execs.json");

module.exports = {
    loadExecs: function (path) {
        let newFilenames = fs.readdirSync(path);
        let newExecs = {
            "id": null,
            "name": null
        };
        for (let i = 0; i < newFilenames.length; i++) {
            for (let u = 0; u < oldFilenames.length; u++) {
                if (newFilenames[i] === oldFilenames[u].name) {
                    newFilenames.splice(i, 1);
                }
            }
        }
        if (newFilenames.length === 1) {
            newExecs.name = newFilenames[0];
            newExecs.id = oldFilenames.length + 1;
        }
        for (let i = 0; i < oldFilenames.length; i++) {
            if (newFilenames[0] === oldFilenames[i].name) {
                return;
            }
        }
        oldFilenames.push(newExecs);
        update.updateFile(oldFilenames, './dataBase/data/execs.json');
    }
}