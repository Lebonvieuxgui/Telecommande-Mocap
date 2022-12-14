const express = require("express");
const cors = require("cors");
const app = express();
const fs = require("fs");
const projects = require("./database/data/Projects.json");
const scripts = require("./database/data/launchScripts.json");
const execs = require("./database/data/execs.json");
const update = require("./database/utilities/updateFile.js");
const execLoad = require("./database/utilities/loadExecs.js");
const { spawn } = require("child_process");
const { response } = require("express");
var exec = require("child_process").execFile;

/* Allowing the server to be accessed from the localhost. */
var corsOptions = {
  origin: [
    "http://localhost:29205",
    "https://localhost:29205",
    "http://127.0.0.1:29205",
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// PROJECTS

/* A route that is listening for a get request to the url `/projects`. When it receives a request it
will send a response with a status of 200 and the json object
`projects`. */
app.get("/projects", (req, res) => {
  console.log("get");
  res.status(200).json(projects);
});

/* Listening for a get request to the url `/projects/:id`. When it receives a request it will log `get`
to the console and send a response with a status of 200 and the json object `projects`. */
app.get("/projects/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const project = projects.find((project) => project.id === id);
  res.status(200).json(project);
});

/* Listening for a post request to the url `/projects`. When it receives a request it will log `post`
to the console, set the id of the request body to the length of the projects array plus one, push
the request body to the projects array, update the projects file with the new projects array, and
send a response with a status of 200 and the json object `projects`. */
app.post("/projects", (req, res) => {
  console.log("post");
  req.body.id = projects.length + 1;
  projects.push(req.body);
  update.updateFile(projects, "./database/data/Projects.json");
  res.status(200).json(projects);
});

/* Listening for a put request to the url `/projects/`. When it receives a request it will
loop through the request body and set the id of the request body to the length of the projects array

plus one. It will then push the request body to the projects array, update the projects file with
the
new projects array, and send a response with a status of 200 and the json object `projects`. */
app.put("/projects/", (req, res) => {
  for (let i = 0; i < req.body.length; i++) {
    let id = req.body[i].id - 1;
    projects[id] = req.body[i];
  }
  console.log("test");
  update.updateFile(projects, "./database/data/Projects.json");
  res.status(200).json(projects);
});

/* Listening for a put request to the url `/projects/:id`. When it receives a request it will set the id of the request body to the length of the projects array plus one, push
the request body to the projects array, update the projects file with the new projects array, and
send a response with a status of 200 and the json object `projects`. */
app.put("/projects/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let project = projects.find((project) => project.id === id);
  (project.name = req.body.name),
    (project.currentIndex = req.body.currentIndex),
    (project.current = req.body.current),
    update.updateFile(projects, "./database/data/Projects.json");
  res.status(200).json(project);
});

/* This is a delete request that is listening for a request to the url
`/projects/:id`. When it receives a request it will set the id of the request
body to the length of the projects array plus one, push
the request body to the projects array, update the projects file with the new
projects array, and
send a response with a status of 200 and the json object `projects`. */
app.delete("/projects/:id", (req, res) => {
  const id = parseInt(req.body.id);
  console.log(id);
  let project = projects.find((project) => project.id === id);
  projects.splice(projects.indexOf(project), 1);
  let length = projects.length;
  for (let i = id - 1; i < length; i++) {
    projects[i].id--;
  }
  project = projects.find((project) => project.id === id);
  project.current = true;
  update.updateFile(projects, "./database/data/Projects.json");
  res.status(200).json(projects);
});

// SCRIPTS

/* Listening for a get request to the url `/scripts`. When it receives a request it will
send a response with a status of 200 and the json object `scripts`. */
app.get("/scripts", (req, res) => {
  res.send(scripts);
});

/* Listening for a get request to the url `/scripts/:id`. When it receives a request it will send a response with a status of 200 and the json object `projects`. */
app.get("/scripts/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const script = scripts.find((script) => script.id === id);
  res.status(200).json(script);
});

function executeScript(script) {
  return new Promise((resolve, reject) => {
    var startTokens = [];
    var stopTokens = [];
    if (script.executableName.endsWith(".py")) {
      startTokens[0] = "./database/scripts/" + script.executableName;
      stopTokens[0] = "./database/scripts/" + script.executableName;
    }
    var dataToSend;
    let run;
    for (tokens in script.startTokens) {
      startTokens.push(script.startTokens[tokens]);
    }
    for (tokens in script.stopTokens) {
      stopTokens.push(script.stopTokens[tokens]);
    }
    console.log(script.stopTokens)
    if (script.variables[0].value === false) {
      if (script.executableName.endsWith(".py")) {
        run = spawn("python", startTokens);
      } else {
        run = exec(
          "./database/scripts/" + script.executableName, script.startTokens,
          function (err, data) {
            console.log(err);
            console.log(data.toString());
          }
        );
      }
    } else {
      if (script.executableName.endsWith(".py")) {
        run = spawn("python", stopTokens);
      } else {
        run = exec(
          "./database/scripts/" + script.executableName, script.stopTokens,
          function (err, data) {
            console.log(err);
            console.log(data.toString());
          }
        );
      }
    }
    run.stdout.on("data", function (data) {
      dataToSend = data.toString();
    });
    run.stderr.on("data", (data) => {
      reject(`child stderr:\n${data}`);
    });
    run.on("close", (code) => {
      console.log(dataToSend);
      resolve(`child process close all stdio with code ${code}`);
    });
  });
}

app.post("/scripts", (req, res) => {
  let toExecute = [];
  var positiveReturns = [];
  var negativeReturns = [];
  let returns = [];
  let errorStatus = 0;
  for (let script in req.body) {
    toExecute.push({ func: executeScript, arg: req.body[script] });
  }
  Promise.all(toExecute.map((prom) => prom.func(prom.arg)))
    .then((result) => {
      console.log(result);
      returns[0] += "/" + result;
      res.status(200).json(returns);
    })
    .catch((error) => {
      console.log(error);
      returns[1] += "/" + error;
      errorStatus++;
      res.status(400).json(returns);
    });
});

/* Listening for a put request to the url `/scripts/:id`. When it receives a request it will set the id
of the request body to the length of the scripts array plus one, push
the request body to the scripts array, update the scripts file with the new scripts array, and
send a response with a status of 200 and the json object `scripts`. */
app.put("/scripts/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let script = scripts.find((script) => script.id === id);
  (script.name = req.body.name),
    (script.executableName = req.body.executableName),
    (script.startArgs = req.body.startArgs),
    (script.stopArgs = req.body.stopArgs),
    (script.stopTokens = req.body.stopTokens),
    (script.startTokens = req.body.startTokens),
    console.log("wow");
  update.updateFile(scripts, "./database/data/launchScripts.json");
  res.status(200).json(script);
});

/* Listening for a delete request to the url `/scripts/:id`. When it receives a request it will set the
id of the request body to the length of the scripts array plus one, push
the request body to the scripts array, update the scripts file with the new scripts array, and
send a response with a status of 200 and the json object `scripts`. */
app.delete("/scripts/:id", (req, res) => {
  const id = parseInt(req.params.id);
  let script = scripts.find((script) => script.id === id);
  scripts.splice(scripts.indexOf(script), 1);
  res.status(200).json(scripts);
});

// EXECUTABLES

/* Listening for a get request to the url `/execs`. When it receives a request it will
call the function `loadExecs` from the file `loadExecs.js` and pass it the string
`./database/scripts`.
It will then send a response with a status of 200 and the json object `execs`. */
app.get("/execs", (req, res) => {
  execLoad.loadExecs("./database/scripts");
  res.send(execs);
});

/* Listening for a get request to the url `/execs/:id`. When it receives a request it will send a
response with a status of 200 and the json object `execs`. */
app.get("/execs/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const exec = execs.find((exec) => exec.id === id);
  res.status(200).json(exec);
});

// OTHER

/* Telling the server to listen for requests on port 3000. */
app.listen(3000, () => {});
console.log("OK")
