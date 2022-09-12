let supportedFormats = [
  { name: "640p50", fps: 50, x_resolution: 640, y_resolution: 480 },
  { name: "640p60", fps: 60, x_resolution: 640, y_resolution: 480 },
  { name: "640p90", fps: 90, x_resolution: 640, y_resolution: 480 },
  { name: "720p50", fps: 50, x_resolution: 720, y_resolution: 540 },
  { name: "720p60", fps: 60, x_resolution: 720, y_resolution: 540 },
  { name: "1080p25", fps: 25, x_resolution: 1080, y_resolution: 810 },
  { name: "1080p30", fps: 30, x_resolution: 1080, y_resolution: 810 }
];

let picamSettingsFile;

let state = require("../state");

/**
 * Helper class used to manage the picam settings.
 *
 * @class SettingsHelper
 */
class SettingsHelper {
  /**
   * Sets the picam configuration filename. Default is "picam-settings.json"
   *
   * @static
   * @param {string} fileName The file to use as config file.
   * @memberof SettingsHelper
   */
  static set settingsFile(fileName) {
    picamSettingsFile = fileName;
  }

  /**
   * Returns the picam configuration filename.
   *
   * @readonly
   * @static
   * @memberof SettingsHelper
   */
  static get settingsFile() {
    return picamSettingsFile;
  }

  /**
   * Gets the settings as a JSON Object.
   *
   * @readonly
   * @static
   * @throws Will throw an error if the config file cannot be opened or read.
   * @memberof SettingsHelper
   */
  static get settings() {
    var fs = require("fs");

    try {
      var content = fs.readFileSync(picamSettingsFile);

      var jsonContent = JSON.parse(content);

      state.settings = jsonContent;
    } catch (error) {
      throw error;
    }

    return state.settings;
  }

  /**
   * Sets the settings
   *
   * @param {Object} jsonContent Contains all the new settings.
   * @static
   * @memberof SettingsHelper
   */
  static set settings(jsonContent) {
    var fs = require("fs");

    try {
      fs.writeFile(
        picamSettingsFile,
        JSON.stringify(jsonContent),
        "utf-8",
        function(err) {
          if (err) {
            throw err;
          }

          state.settings = jsonContent;
        }
      );
    } catch (err) {
      throw err;
    }
  }

  /**
   * Gets the helmet's current name from config file.
   *
   * @readonly
   * @static
   * @throws Will throw an error if the config file cannot be opened or read.
   * @memberof SettingsHelper
   */
  static get helmetName() {
    var fs = require("fs");

    var content = fs.readFileSync(picamSettingsFile);
    var jsonContent = JSON.parse(content);

    return jsonContent.name;
  }

  /**
   * Gets the current recording format from config file.
   *
   * @readonly
   * @static
   * @throws Will throw an error if the config file cannot be opened or read.
   * @memberof SettingsHelper
   */
  static get format() {
    var fs = require("fs");

    var content = fs.readFileSync(picamSettingsFile);
    var jsonContent = JSON.parse(content);

    var format = jsonContent.format.x_resolution + "p" + jsonContent.format.fps;

    return format;
  }

  /**
   * Gets the recording formats available to picam.
   *
   * @readonly
   * @static
   * @memberof SettingsHelper
   */
  static get supportedFormats() {
    return supportedFormats;
  }

  /**
   * Takes a format name as string and returns the related informations as a JSON Object.
   *
   * @static
   * @param {string} formatName One of the formats available.
   * @returns {JSON} JSON object containing "fps", "x_resolution" and "y_resolution" fields. Returns null if no format has been found.
   * @memberof SettingsHelper
   */
  static FormatToObject(formatName) {
    for (let i = 0; i < supportedFormats.length; i++) {
      const element = supportedFormats[i];

      if (element.name === formatName) {
        return {
          fps: element.fps,
          x_resolution: element.x_resolution,
          y_resolution: element.y_resolution
        };
      }
    }

    return null;
  }
}

module.exports = SettingsHelper;
