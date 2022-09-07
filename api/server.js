const express = require('express');
const cors = require('cors');
const app = express();
const fs = require("fs");
const projects = require("./dataBase/data/Projects.json");
const scripts = require("./dataBase/data/launchScripts.json");
const execs = require("./dataBase/data/execs.json");
const update = require("./dataBase/utilities/updateFile.js");
const execLoad = require("./dataBase/utilities/loadExecs.js");

var corsOptions = {
    origin: 'http://localhost:29205',
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())

// PROJECTS

app.get('/projects', (req, res) => {
    console.log("get")
    res.status(200).json(projects);
});

app.get('/projects/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const project = projects.find(project => project.id === id);
    res.status(200).json(project);
});

app.post('/projects', (req,res) => {
    console.log("post");
    req.body.id = projects.length + 1;
    projects.push(req.body);
    update.updateFile(projects, './dataBase/data/Projects.json')
    res.status(200).json(projects);
});

app.put('/projects/', (req, res) => {
    for (let i = 0; i < req.body.length; i++) {
        let id = req.body[i].id - 1;
        projects[id] = req.body[i];
    }
    console.log("test");
    update.updateFile(projects, './dataBase/data/Projects.json');
    res.status(200).json(projects);
});

app.put('/projects/:id', (req,res) => {
    console.log(req.body);
    const id = parseInt(req.params.id)
    let project = projects.find(project => project.id === id)
    project.name =req.body.name,
    project.currentIndex =req.body.currentIndex,
    project.current =req.body.current,
    update.updateFile(projects, './dataBase/data/Projects.json')
    res.status(200).json(project)
});

app.delete('/projects/:id', (req,res) => {
    const id = parseInt(req.params.id)
    let project = projects.find(project => project.id === id)
    projects.splice(projects.indexOf(project),1)
    res.status(200).json(projects)
});

// SCRIPTS

app.get('/scripts', (req, res) => {
    res.send(scripts);
});

app.get('/scripts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const script = scripts.find(script => script.id === id);
    res.status(200).json(script);
});

app.post('/scripts', (req,res) => {
    scripts.push(req.body);
    res.status(200).json(scripts);
});

app.put('/scripts/:id', (req,res) => {
    const id = parseInt(req.params.id)
    let script = scripts.find(script => script.id === id)
    script.name =req.body.name,
    script.executableName =req.body.executableName,
    script.startArgs =req.body.startArgs,
    script.stopArgs =req.body.stopArgs,
    console.log('wow');
    update.updateFile(scripts, './dataBase/data/launchScripts.json')
    res.status(200).json(script)
});

app.delete('/scripts/:id', (req,res) => {
    const id = parseInt(req.params.id)
    let script = scripts.find(script => script.id === id)
    scripts.splice(scripts.indexOf(script),1)
    res.status(200).json(scripts)
});

// EXECUTABLES

app.get('/execs', (req, res) => {
    //update.updateFile(JSON.stringify(names), './dataBase/data/execs.json')
    execLoad.loadExecs('./database/scripts')
    res.send(execs);
});

app.get('/execs/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const exec = execs.find(exec => exec.id === id);
    res.status(200).json(exec);
});

// OTHER

app.listen(3000, () => {
});
