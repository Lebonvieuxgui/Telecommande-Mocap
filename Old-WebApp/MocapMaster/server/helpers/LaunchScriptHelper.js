const { exec } = require("child_process");
const appRoot = require("app-root-path");
const logger = require(appRoot + "/server/config/winston.js");

const config = require("../config/config");

/**
 * Helper class that retrieves and manages execution scripts
 *
 * @class LaunchScriptHelper
 */
class LaunchScriptHelper {
  /**
   * Returns the command parameters based on variables.
   *
   * @static
   * @param {Object} script Script to get arguments from.
   * @param {Array} scriptVars Script variables to construct the command with.
   * @param {Boolean} start "true" for start arguments, "false" for stop arguments
   * @returns {String} Returns the command parameters for executing a given script.
   * @memberof LaunchScriptHelper
   */
  static GetScriptCallArguments(script, scriptVars, start) {
    let scriptCall = "";

    let scriptTokens;

    console.log(scriptVars);

    if (start === true) {
      scriptTokens = script.startTokens;
    } else {
      scriptTokens = script.stopTokens;
    }

    for (let i = 0; i < scriptTokens.length; i++) {
      const token = scriptTokens[i];

      let variable = null;

      scriptVars.forEach(v => {
        let re = new RegExp("[$]" + v.name.substring(1) + "$", "i");

        let match = token.match(re);

        if (match != null) {
          variable = " " +
            token.slice(0, match.index) + "\"" +
            (v.value ? v.value : "") + "\"";
        }
      });

      if (variable === null) {
        scriptCall += " " + token;
      } else {
        scriptCall += variable;
      }
    }

    console.log(scriptCall);

    return scriptCall;
  }

  /**
   * Executes a script
   *
   * @static
   * @param {Object} script Script to execute.
   * @param {Array} variables Variables to add to the script call
   * @param {Boolean} start Determines which arguments to pass at execution.
   * @returns {Promise} A promise that will be resolved if the script has started correctly, rejected otherwise.
   * @memberof LaunchScriptHelper
   */
  static Execute(script, variables, start) {
    return new Promise((resolve, reject) => {
      let args = LaunchScriptHelper.GetScriptCallArguments(
        script,
        variables,
        start
      );

      let command =
        (script.executableName.endsWith(".py") ? "python " : "") +
        config.launchScriptsDirectory +
        "/" +
        script.executableName +
        args;

      exec(command, (err, stdout, stderr) => {
        if (err) {
          logger.logError(err);
          reject(err);
        }

        resolve();
      });
    });
  }

  /**
   *
   *
   * @static
   * @param {String} [folder=config.launchScriptsDirectory] The folder in which to search for executable files.
   * @param {String} [prefix=null] Prefix to add before filenames, e.g the path from script root dir.
   * @returns {String[]} An array containing the name of all the executable files found in the reserved directory and his childrens.
   * @memberof LaunchScriptHelper
   */
  static DetectScripts(folder = config.launchScriptsDirectory, prefix = null) {
    const fs = require("fs");
    let scripts = [];

    try {
      fs.readdirSync(folder).forEach(file => {
        let path = folder + "/" + file;
        let stats = fs.statSync(path);

        if (prefix) {
          file = prefix + "/" + file;
        }

        if (stats.isDirectory()) {
          scripts = scripts.concat(
            LaunchScriptHelper.DetectScripts(path, file)
          );
        } else {
          scripts.push(file);
        }
      });
    } catch (error) {
      logger.logError(error);
      throw error;
    }

    return scripts;
  }

  /**
   * Detects arguments in the given string and returns them as a token array.
   *
   * @static
   * @param {String} str The string containing the arguments.
   * @returns {Array} An array of tokens corresponding to the arguments found in the string.
   * @memberof LaunchScriptHelper
   */
  static ParseVariables(str) {
    return str.match(/\\?.|^$/g).reduce(
      (p, c) => {
        if (c === "\"") {
          p.quote ^= 1;
        } else if (!p.quote && c === " ") {
          p.a.push("");
        } else {
          p.a[p.a.length - 1] += c.replace(/\\(.)/, "$1");
        }

        return p;
      },
      { a: [""] }
    ).a;
  }

  /**
   * Detects variables in a given string.
   *
   * @static
   * @param {String} str The string containing the arguments.
   * @returns {Object} Returns the variables found, as well as the "tokenified" string
   * @memberof LaunchScriptHelper
   */
  static ExtractVariables(str) {
    if (str === undefined || str === null) {
      return null;
    }

    str = str.replace("\n", " ");

    let tokens = LaunchScriptHelper.ParseVariables(str);

    let variables = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      let match = token.match(/[$].+$/i);

      if (match !== null) {
        variables.push({ name: token.slice(match.index), value: null });
      }
    }

    return { tokens: tokens, variables: variables };
  }
}

module.exports = LaunchScriptHelper;
