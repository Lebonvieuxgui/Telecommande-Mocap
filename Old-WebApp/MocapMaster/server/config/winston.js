const winston = require("winston");
var logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" })
  ]
});

// Shortcuts
logger.logInfo = function(message) {
  this.log({
    level: "info",
    message: message
  });
};

logger.logDebug = function(message) {
  this.log({
    level: "debug",
    message: message
  });
};

logger.logError = function(message) {
  this.log({
    level: "error",
    message: message
  });
};

// Adds logging to console when not in production
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
      colors: true,
      json: true
    })
  );
}

global.logger = logger;

module.exports = logger;
