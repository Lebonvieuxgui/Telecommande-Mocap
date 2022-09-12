var mongoose = require("mongoose");
const config = require("./config.js");

mongoose.connect(
  "mongodb://" +
    config.db.account.name +
    ":" +
    config.db.account.password +
    "@localhost/" +
    config.db.name
);
