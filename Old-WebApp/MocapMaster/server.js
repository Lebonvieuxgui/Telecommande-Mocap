#!/usr/bin/env

const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const isProd =
  typeof process.env.NODE_ENV !== "undefined" &&
  process.env.NODE_ENV === "production";

// Custom config files
require("./server/config/db.js");
require("./server/config/LaunchScripts.js");
require("./server/config/winston.js");
require("./server/config/network.js");

const indexHTML = (() => {
  return fs.readFileSync(path.resolve(__dirname, "./index.html"), "utf-8");
})();

process.title = "mocap-master";

if (isProd) {
  app.use("/", express.static(path.resolve(__dirname, "./dist")));
} else {
  app.use("/dist", express.static(path.resolve(__dirname, "./dist")));
  app.use("/assets", express.static(path.resolve(__dirname, "./assets")));
}

app.use("/api/network", require("./server/controllers/NetworkController"));
app.use("/api/settings", require("./server/controllers/SettingsController"));
app.use("/api/scripts", require("./server/controllers/LaunchScriptController"));
app.use("/api/project", require("./server/controllers/ProjectController"));

if (isProd) {
} else {
  require("./build/dev-server")(app);
}

app.get("*", (req, res) => {
  res.write(indexHTML);
  res.end();
});

const port = 3000;

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
