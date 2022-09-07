
const fs = require('fs');

function deleteNull(data) {
    var clean = [];
    let j = 0;
    for (let i in data) {
        if (data[i] != null) {
            clean[j] = data[i];
            j++;
        }
    }
    return clean;
}

module.exports = {
    updateFile: function(projects, path) {
    projects = deleteNull(projects);
    fs.writeFile(path, JSON.stringify(projects, "", 4), (err) => {
        if (err) console.log(err);
        return err;
    });
    return true;
}}
