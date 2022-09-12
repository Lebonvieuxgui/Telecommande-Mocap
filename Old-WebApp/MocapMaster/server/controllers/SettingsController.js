const express = require("express");
const appRoot = require("app-root-path");
const bodyParser = require("body-parser");
const logger = require(appRoot + "/server/config/winston.js");

// Helpers
const SettingsHelper = require("../helpers/SettingsHelper");

// Router config
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

/**
 *
 * @api {get} /settings Request settings information
 * @apiName GetSettings
 * @apiGroup Settings
 * @apiVersion  1.0.0
 *
 * @apiSuccess {Object} settings Helmet Settings
 * @apiSuccess {Object} settings.format Format settings
 * @apiSuccess {Number} settings.format.fps Number of frames per second
 * @apiSuccess {Number} settings.format.x_resolution Horizontal resolution
 * @apiSuccess {Number} settings format.y_resolution Vertical resolution
 * @apiSuccess {String} settings.name Helmet name
 *
 * @apiSuccessExample {json} Success:
 *    HTTP/1.1 200 OK
 *    {
 *        format: { "fps": 60, "x_resolution": 640, "y_resolution": 480 },
 *        name: "Helmet1"
 *    }
 *
 * @apiError (500) SettingsFileNotFound The settings file was not found.
 *
 * @apiErrorExample {json} Error:
 *    HTTP/1.1 500 Internal Server Error
 */
router.get("/", function(req, res) {
  try {
    var jsonContent = SettingsHelper.settings;
  } catch (error) {
    logger.logError("SettingsFileNotFound");
    return res.status(500).send({ error: "SettingsFileNotFound" });
  }

  return res.status(200).send(jsonContent);
});

/**
 *
 * @api {get} /settings/formats Request valid formats
 * @apiName GetFormats
 * @apiGroup Settings
 * @apiVersion  1.0.0
 *
 * @apiSuccess {Object[]} formats Format list
 * @apiSuccess {String} formats.name Format name
 * @apiSuccess {Number} formats.fps Format fps
 * @apiSuccess {Number} formats.x_resolution Format horizontal resolution
 * @apiSuccess {Number} formats.y_resolution Format vertical resolution
 *
 * @apiSuccessExample {json} Success:
 *    HTTP/1.1 200 OK
 *    {[
 *      { name: "640p50", fps: 50, x_resolution: 640, y_resolution: 480 },
 *      { name: "640p60", fps: 60, x_resolution: 640, y_resolution: 480 },
 *      { name: "640p90", fps: 90, x_resolution: 640, y_resolution: 480 },
 *      { name: "720p50", fps: 50, x_resolution: 720, y_resolution: 540 },
 *      { name: "720p60", fps: 60, x_resolution: 720, y_resolution: 540 },
 *      { name: "1080p25", fps: 25, x_resolution: 1080, y_resolution: 810 },
 *      { name: "1080p30", fps: 30, x_resolution: 1080, y_resolution: 810 }
 *    ]}
 */
router.get("/formats", function(req, res) {
  return res.status(200).send(SettingsHelper.supportedFormats);
});

module.exports = router;
