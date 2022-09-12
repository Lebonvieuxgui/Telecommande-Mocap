// const appRoot = require("app-root-path");
// const logger = require(appRoot + "/server/config/winston.js");
const { exec } = require("child_process");

/**
 * Helper class that manages network-related variables
 *
 * @class NetworkHelper
 */
class NetworkHelper {
  /**
   * Returns the raspberry IP address
   *
   * @readonly
   * @static
   * @memberof NetworkHelper
   */
  static get ipAddress() {
    var address;
    var ifaces = require("os").networkInterfaces();

    for (var dev in ifaces) {
      ifaces[dev].filter(
        details =>
          details.family === "IPv4" && details.internal === false
            ? (address = details.address)
            : undefined
      );
    }

    return address;
  }

  /**
   * Returns the raspberry hostname
   *
   * @readonly
   * @static
   * @memberof NetworkHelper
   */
  static get hostname() {
    return new Promise((resolve, reject) => {
      exec("hostname", (err, stdout, stderr) => {
        if (err) {
          reject(err);
        }

        resolve(stdout.toString().slice(0, -1));
      });
    });
  }
}

module.exports = NetworkHelper;
