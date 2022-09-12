const express = require("express");
const bodyParser = require("body-parser");

// Helpers
const LaunchScriptHelper = require("../helpers/LaunchScriptHelper");

const LaunchScripts = require("../data/LaunchScript");

const { check, validationResult } = require("express-validator/check");

// Router config
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

/**
 *
 * @api {get} /scripts Request all scripts
 * @apiName GetScripts
 * @apiGroup Scripts
 * @apiVersion  1.0.0
 *
 * @apiSuccess {Object[]} scripts
 * @apiSuccess {String} scripts.name Name of the script.
 * @apiSuccess {String} scripts.executableName Name of the binary file that will be executed when the script is called.
 * @apiSuccess {String} scripts.startArguments Command Line startArguments that will be used when the script is called.
 * @apiSuccess {String} scripts.stopArguments Command Line stopArguments that will be used when the script is called.
 *
 * @apiSuccessExample {json} Success:
 *    HTTP/1.1 200 OK
 *    {
 *      scripts: [
 *        {
 *          name: "Vicon",
 *          executableName: "vicon.sh",
 *          startArguments: "--input_file test"
 *        },
 *        {
 *          name: "Dummy",
 *          executableName: "dummy.py",
 *          startArguments: ""
 *        },
 *      ]
 *    }
 *
 * @apiError (500) DatabaseError The scripts could not be retrieved from the database.
 *
 * @apiErrorExample {json} Error:
 *    HTTP/1.1 500 Internal Server Error
 *    {
 *      error: "DatabaseError"
 *    }
 */
router.get("/", (req, res) => {
  LaunchScripts.find({}, function(err, Scripts) {
    if (err) {
      return res.status(500).send("DatabaseError");
    }

    return res.status(200).send({ scripts: Scripts });
  });
});

/**
 *
 * @api {get} /scripts/detected Request all detected executable files
 * @apiName GetDetectedExecutables
 * @apiGroup Scripts
 * @apiVersion  1.0.0
 *
 * @apiSuccess {Array} scripts
 * @apiSuccess {String} scripts[i] Element of "scripts"k, the name of a found executable file.
 *
 * @apiSuccessExample {json} Success:
 *    HTTP/1.1 200 OK
 *    {
 *      scripts: ["vicon.sh", "dummy.py"]
 *    }
 */
router.get("/detected", (req, res) => {
  try {
    let scripts = LaunchScriptHelper.DetectScripts();

    return res.status(200).send({ scripts: scripts });
  } catch (error) {
    return res.status(200).send({ scripts: [] });
  }
});

/**
 *
 * @api {delete} scripts/:id Delete script
 * @apiName DeleteScript
 * @apiGroup Scripts
 * @apiVersion  1.0.0
 *
 * @apiParam {String} id Script identifier
 *
 * @apiSuccessExample {json} Success:
 *    HTTP/1.1 200 OK
 *
 * @apiError (404) ClipNotFound Script not found
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       error: "ScriptNotFound"
 *     }
 */
router.delete("/delete/:id", (req, res) => {
  LaunchScripts.findByIdAndRemove(req.params.id, function(err, script) {
    if (err) {
      return res.status(404).send("ScriptNotFound");
    }

    return res.status(200).send("yay");
  });
});

/**
 *
 * @api {put} scripts/:id Update script informations
 * @apiName UpdateScript
 * @apiGroup Scripts
 * @apiVersion  1.0.0
 *
 * @apiParam {String} id Script identifier
 * @apiParam {String} name New script name
 * @apiParam {String} executableName New script executable name
 * @apiParam {String} startArguments New script command line startArguments
 * @apiParam {String} stopArguments New script command line stopArguments
 *
 * @apiParamExample {json} Input
 *    {
 *        name: "vicon",
 *        executableName: "executableName",
 *        startArguments: "--input_file test",
 *        stopArguments: ""
 *    }
 *
 * @apiSuccess {Object} script Updated script
 * @apiSuccess {String} name Updated script name
 * @apiSuccess {String} executableName Updated script executable name
 * @apiSuccess {String} startArguments Updated script command line startArguments
 * @apiSuccess {String} stopArguments Updated script command line stopArguments
 *
 * @apiSuccessExample {json} Success:
 *    HTTP/1.1 200 OK
 *    {
 *      script: {
 *        name: "vicon",
 *        executableName: "executableName",
 *        startArguments: "--input_file test",
 *        stopArguments: "",
 *        _id: "hbuih567guygu"
 *      }
 *    }
 *
 * @apiError (422) InvalidParameters Passed parameters are invalid
 * @apiError (422) InvalidExecutableName Passed executable name does not references any executable found
 * @apiError (404) ScriptNotFound Script could not be retrieved from the database due to an invalid identifier
 * @apiError (500) DatabaseError Script could not be retrieved from the database, likely a server-side problem
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       error: "ScriptNotFound"
 *     }
 */
router.put(
  "/update/:id",
  [
    check("name")
      .exists()
      .isLength({ min: 1 }),
    check("executableName")
      .exists()
      .isLength({ min: 1 })
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ error: "InvalidParameters" });
    }

    let scripts = LaunchScriptHelper.DetectScripts();

    // Checks if the executable was found
    if (!scripts.includes(req.body.executableName)) {
      return res.status(422).send({ error: "InvalidScriptName" });
    }

    if (req.body.startArguments === null) req.body.startArguments = "";
    if (req.body.stopArguments === null) req.body.stopArguments = "";

    let startVariables = LaunchScriptHelper.ExtractVariables(
      req.body.startArguments
    );
    let stopVariables = LaunchScriptHelper.ExtractVariables(
      req.body.stopArguments
    );

    stopVariables.variables.forEach(stopVariable => {
      let toAdd = true;

      startVariables.variables.forEach(startVariable => {
        if (stopVariable.name === startVariable.name) {
          toAdd = false;
        }
      });

      if (toAdd === true) {
        startVariables.variables.push(stopVariable);
      }
    });

    let newScript = {
      name: req.body.name,
      executableName: req.body.executableName,
      startArguments: req.body.startArguments,
      stopArguments: req.body.stopArguments,
      variables: startVariables.variables,
      startTokens: startVariables.tokens,
      stopTokens: stopVariables.tokens
    };

    // Checks if a script with the same name already exists
    LaunchScripts.findByIdAndUpdate(
      req.params.id,
      newScript,
      { new: true },
      function(err, script) {
        if (err) {
          return res.status(500).send({ error: "DatabaseError" });
        }

        if (script === null) {
          return res.status(404).send({
            error: "ScriptNotFound"
          });
        }

        return res.status(200).send({ script: script });
      }
    );
  }
);

/**
 *
 * @api {post} scripts/ Create a new script
 * @apiName PostScript
 * @apiGroup Scripts
 * @apiVersion  1.0.0
 *
 * @apiParam {String} name Script name
 * @apiParam {String} executableName Script executable name
 * @apiParam {String} startArguments Script command line startArguments
 * @apiParam {String} stopArguments Script command line stopArguments
 * @apiParamExample {json} Input
 *    {
 *        name: "vicon",
 *        executableName: "executableName",
 *        startArguments: "--input_file test",
 *        stopArguments: ""
 *    }
 *
 * @apiSuccess {Object} script New script
 * @apiSuccess {String} name New script name
 * @apiSuccess {String} executableName New script executable name
 * @apiSuccess {String} startArguments New script command line startArguments
 * @apiSuccess {String} stopArguments New script command line stopArguments
 *
 * @apiSuccessExample {json} Success:
 *    HTTP/1.1 200 OK
 *    {
 *      script: {
 *        name: "vicon",
 *        executableName: "executableName",
 *        startArguments: "--input_file test",
 *        stopArguments: "",
 *        _id: "hbuih567guygu"
 *      }
 *    }
 *
 * @apiError (422) InvalidParameters Passed parameters are invalid
 * @apiError (422) InvalidExecutableName Passed executable name does not references any executable found
 * @apiError (409) DuplicateFound Could not create a new script because one with the same name has been found
 * @apiError (500) DatabaseError Could not interact with database
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       error: "ScriptNotFound"
 *     }
 */
router.post(
  "/create",
  [
    check("name")
      .exists()
      .isLength({ min: 1 }),
    check("executableName")
      .exists()
      .isLength({ min: 1 })
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ error: "InvalidParameters" });
    }

    // Checks if a script with the same name already exists
    LaunchScripts.findOne({ name: req.body.name }, function(err, script) {
      if (err) {
        return res.status(500).send({ error: "DatabaseError" });
      }

      if (script !== null) {
        return res.status(409).send({
          error: "DuplicateFound"
        });
      }

      let scripts = LaunchScriptHelper.DetectScripts();

      // Checks if the executable was found
      if (!scripts.includes(req.body.executableName)) {
        return res.status(422).send({ error: "InvalidScriptName" });
      }

      if (req.body.startArguments === null) req.body.startArguments = "";
      if (req.body.stopArguments === null) req.body.stopArguments = "";

      let startVariables = LaunchScriptHelper.ExtractVariables(
        req.body.startArguments
      );
      let stopVariables = LaunchScriptHelper.ExtractVariables(
        req.body.stopArguments
      );

      stopVariables.variables.forEach(stopVariable => {
        let toAdd = true;

        startVariables.variables.forEach(startVariable => {
          if (stopVariable.name === startVariable.name) {
            toAdd = false;
          }
        });

        if (toAdd === true) {
          startVariables.variables.push(stopVariable);
        }
      });

      LaunchScripts.create(
        {
          name: req.body.name,
          executableName: req.body.executableName,
          startArguments: req.body.startArguments,
          stopArguments: req.body.stopArguments,
          variables: startVariables.variables,
          startTokens: startVariables.tokens,
          stopTokens: stopVariables.tokens
        },
        (err, script) => {
          if (err) {
            return res.status(500).send({ error: "DatabaseError" });
          }

          return res.status(200).send({ script: script });
        }
      );
    });
  }
);

/**
 *
 * @api {post} scripts/start Start a list of scripts
 * @apiName StartScripts
 * @apiGroup Scripts
 * @apiVersion  1.0.0
 *
 * @apiParam {Array} scripts
 * @apiParam {String} scripts.id
 * @apiParam {Array} scripts.variables
 * @apiParam {String} scripts.variables.name
 * @apiParam {String} scripts.variables.value
 * @apiParamExample {json} Input
 *    {
 *        scripts: [
 *          {
 *            id: "5b17e0e5c797f23598c51ab0",
 *            variables: [
 *              {
 *                name: "$OUTPUT",
 *                value: "/home/pi/out/mp4"
 *              }
 *            ]
 *          },
 *          {
 *            id: "5b17e0efc797f23598c51ab1",
 *            variables: []
 *          }
 *        ]
 *    }
 *
 * @apiSuccessExample {json} Success:
 *    HTTP/1.1 200 OK
 *
 * @apiError (422) InvalidParameters Passed parameters are invalid
 * @apiError (422) ScriptNotFound Specified script could not be retreived from the database
 * @apiError (500) DatabaseError Could not interact with database
 * @apiError (500) ScriptExecutionError Script has failed to start correctly
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       error: "ScriptNotFound"
 *     }
 */
router.post("/start", (req, res) => {
  let scripts = req.body.scripts;

  if (scripts !== null) {
    scripts.forEach(s => {
      let id = s.id;
      let variables = s.variables;

      LaunchScripts.findById(id, (err, script) => {
        if (err) {
          global.logger.logError("DatabaseError");
        }

        if (script === null) {
          return res.status(422).send({ error: "ScriptNotFound" });
        }

        script.variables = variables;
        script.tokens = script.startTokens;

        LaunchScriptHelper.Execute(script, variables, true)
          .then(() => {
            return res.status(200).send();
          })
          .catch(() => {
            return res.status(500).send({ error: "ScriptExecutionError" });
          });
      });
    });
  } else {
    return res.status(422).send({ error: "InvalidParameters" });
  }
});

/**
 *
 * @api {post} scripts/stop Stop a list of scripts
 * @apiName StopScripts
 * @apiGroup Scripts
 * @apiVersion  1.0.0
 *
 * @apiParam {Array} scripts
 * @apiParam {String} scripts.id
 * @apiParam {Array} scripts.variables
 * @apiParam {String} scripts.variables.name
 * @apiParam {String} scripts.variables.value
 * @apiParamExample {json} Input
 *    {
 *        scripts: [
 *          {
 *            id: "5b17e0e5c797f23598c51ab0",
 *            variables: [
 *              {
 *                name: "$OUTPUT",
 *                value: "/home/pi/out/mp4"
 *              }
 *            ]
 *          },
 *          {
 *            id: "5b17e0efc797f23598c51ab1",
 *            variables: []
 *          }
 *        ]
 *    }
 *
 * @apiSuccessExample {json} Success:
 *    HTTP/1.1 200 OK
 *
 * @apiError (422) InvalidParameters Passed parameters are invalid
 * @apiError (422) ScriptNotFound Specified script could not be retreived from the database
 * @apiError (500) DatabaseError Could not interact with database
 * @apiError (500) ScriptExecutionError Script has failed to stop correctly
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       error: "ScriptNotFound"
 *     }
 */
router.post("/stop", (req, res) => {
  let scripts = req.body.scripts;

  if (scripts !== null) {
    scripts.forEach(s => {
      let id = s.id;
      let variables = s.variables;

      LaunchScripts.findById(id, (err, script) => {
        if (err) {
          global.logger.logError("DatabaseError");
        }

        if (script === null) {
          return res.status(422).send({ error: "ScriptNotFound" });
        }

        script.variables = variables;
        script.tokens = script.startTokens;

        LaunchScriptHelper.Execute(script, variables, false)
          .then(() => {
            return res.status(200).send();
          })
          .catch(() => {
            return res.status(500).send({ error: "ScriptExecutionError" });
          });
      });
    });
  } else {
    return res.status(422).send({ error: "InvalidParameters" });
  }
});

module.exports = router;
