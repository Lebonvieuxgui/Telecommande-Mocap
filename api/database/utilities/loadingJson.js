
const DATA_PATH = "../data/";
const PROJECTS_PATH = DATA_PATH + "projects.json";
const LAUNCHSCRIPT_PATH = DATA_PATH + "launchscript.json";

const projectData = require(PROJECTS_PATH);
const launchScriptData = require(LAUNCHSCRIPT_PATH);

var existingProjects = [];
var launchScripts = [];

function find() {
  for (let i = 0; i < projectData.length; i++) {
    existingProjects.push(projectData[i]);
  }
};

for (let i = 0; i < launchScriptData.length; i++) {
  launchScripts.push(launchScriptData[i]);
}

export { existingProjects, launchScripts };
