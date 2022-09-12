const express = require("express");
const bodyParser = require("body-parser");
const {
  check,
  validationResult
} = require("express-validator/check");
const {
  sanitize
} = require("express-validator/filter");

// Helpers
const ProjectHelper = require("../helpers/ProjectHelper");

// Router config
const router = express.Router();

const Projects = require("../data/Project.js");

router.use(bodyParser.urlencoded({
  extended: true
}));
router.use(bodyParser.json());

/**
 *
 * @api {get} /project/getAll Request the list of projects available
 * @apiName GetAllProjects
 * @apiGroup Network
 * @apiVersion  1.0.0
 *
 * @apiSuccess {Array} projects The list of projects
 * @apiSuccess {String} projects.id The projects's database id
 * @apiSuccess {String} projects.name The project's name
 * @apiSuccess {Number} projects.currentindex The project's current take index
 * @apiSuccess {Boolean} projects.current True if the project is the current project, false otherwise
 *
 * @apiSuccessExample {json} Success:
 *    HTTP/1.1 200 OK
 *    {
 *      "projects": [
 *        {
 *           "_id": "5b696db36a71ce03905331d6",
 *           "name": "ndp",
 *           "currentIndex": 0,
 *           "current": false
 *        },
 *        {
 *           "_id": "5b696dbe6a71ce03905331d7",
 *           "name": "test",
 *           "currentIndex": 3,
 *           "current": true
 *        }
 *      ]
 *   }
 *
 * @apiError (500) DatabaseError The projects could not be retrieved.
 *
 * @apiErrorExample {json} Error:
 *    HTTP/1.1 500 Internal Server Error
 */
router.get("/getAll", (req, res) => {
  Projects.find({}, (err, projects) => {
    if (err) {
      return res.status(500).send({
        error: "DatabaseError"
      });
    }

    return res.status(200).send({
      projects: projects
    });
  });
});

/**
 *
 * @api {get} /project/getAll Request the list of projects available
 * @apiName GetCurrentProject
 * @apiGroup Network
 * @apiVersion  1.0.0
 *
 * @apiSuccess {Array} projects The current project
 * @apiSuccess {String} project.id The projects's database id
 * @apiSuccess {String} project.name The project's name
 * @apiSuccess {Number} project.currentindex The project's current take index
 * @apiSuccess {Boolean} project.current True if the project is the current project, false otherwise
 *
 * @apiSuccessExample {json} Success:
 *    HTTP/1.1 200 OK
 *    {
 *      "project": {
 *         "_id": "5b696db36a71ce03905331d6",
 *         "name": "ndp",
 *         "currentIndex": 0,
 *         "current": false
 *      }
 *   }
 *
 * @apiError (500) DatabaseError The projects could not be retrieved.
 *
 * @apiErrorExample {json} Error:
 *    HTTP/1.1 500 Internal Server Error
 */
router.get("/current", (req, res) => {
  ProjectHelper.getCurrentProject()
    .then(project => {
      return res.status(200).send({
        project: project
      });
    })
    .catch(() => {
      return res.status(500).send({
        error: "DatabaseError"
      });
    });
});

/**
 *
 * @api {delete} /project/:id Deletes a specified project
 * @apiName DeleteProject
 * @apiGroup Scripts
 * @apiVersion  1.0.0
 *
 * @apiParam {String} id Project identifier
 *
 * @apiSuccessExample {json} Success:
 *    HTTP/1.1 200 OK
 *
 * @apiError (404) ClipNotFound Project not found
 * @apiError (500) DatabaseError Projects could not be retrieved from database
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       error: "ProjectNotFound"
 *     }
 */
router.delete("/:id", (req, res) => {
  Projects.findByIdAndRemove(req.params.id, (err, project) => {
    if (err) {
      return res.status(500).send({
        error: "DatabaseError"
      });
    }

    if (project === null) {
      return res.status(404).send({
        error: "ProjectNotFound"
      });
    }

    return res.status(200).send();
  });
});

/**
 *
 * @api {post} project/ Create a new project
 * @apiName CreateProject
 * @apiGroup Project
 * @apiVersion  1.0.0
 *
 * @apiParam {String} name The project's name
 * @apiParam {Number} startIndex The project's starting index. It will be appenned to the filename and incremented for every take
 * @apiParamExample {json} Input
 *    {
 *        name: "test",
 *        startIndex: "0"
 *    }
 *
 * @apiSuccess {Object} project New project
 * @apiSuccess {String} project.name Project's name
 * @apiSuccess {Number} project.currentIndex The project's index, will always equal the "startIndex" parameter
 * @apiSuccess {Boolean} project.current The new project being the current selected project, "current" will always be true
 *
 * @apiSuccessExample {json} Success:
 *    HTTP/1.1 200 OK
 *    {
 *      "project": {
 *         "name": "test",
 *         "currentIndex": 0,
 *         "current": true
 *      }
 *    }
 *
 * @apiError (422) InvalidParameters Passed parameters are invalid
 * @apiError (409) DuplicateFound Could not create a new project because one with the same name has been found
 * @apiError (500) DatabaseError Could not interact with database
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       error: "ScriptNotFound"
 *     }
 */
router.post(
  "/",
  [
    check("name")
    .exists()
    .isLength({
      min: 1
    }),
    check("startIndex")
    .exists()
    .isInt(),
    sanitize("startIndex").toInt()
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).send({
        error: "InvalidParameters"
      });
    }

    Projects.findOne({
      name: req.body.name
    }, function (err, project) {
      if (err) {
        return res.status(500).send({
          error: "DatabaseError"
        });
      }

      if (project !== null) {
        return res.status(409).send({
          error: "DuplicateFound"
        });
      }
    });

    Projects.create({
        name: req.body.name,
        currentIndex: req.body.startIndex,
        current: true
      },
      async function (err, project) {
        if (err) {
          return res.status(500).send({
            error: "DatabaseError"
          });
        }

        ProjectHelper.setCurrentProject(project._id).catch(() => {
          return res.status(500).send({
            error: "DatabaseError"
          });
        });

        return res.status(200).send({
          project: {
            name: req.body.name,
            currentIndex: req.body.startIndex,
            current: true
          }
        });
      }
    );
  }
);

/**
 *
 * @api {put} scripts/:id Update project index and selection
 * @apiName UpdateProject
 * @apiGroup Project
 * @apiVersion  1.0.0
 *
 * @apiParam {String} id Project identifier
 * @apiParam {Boolean} [current=true] Determines if the project is the new selected one
 * @apiParam {Number} currentIndex The project's new index
 *
 * @apiParamExample {json} Input
 *    {
 *        currentIndex: 17,
 *    }
 *
 * @apiSuccess {Array} projects The current project
 * @apiSuccess {String} project.id The projects's database id
 * @apiSuccess {String} project.name The project's name
 * @apiSuccess {Number} project.currentindex The project's current take index
 * @apiSuccess {Boolean} project.current True if the project is the current project, false otherwise
 *
 * @apiSuccessExample {json} Success:
 *    HTTP/1.1 200 OK
 *    {
 *      "project": {
 *         "_id": "5b696db36a71ce03905331d6",
 *         "name": "test",
 *         "currentIndex": 17,
 *         "current": true
 *      }
 *   }
 *
 * @apiError (422) InvalidParameters Passed parameters are invalid
 * @apiError (404) ProjectNotFound Project does not exists
 * @apiError (500) DatabaseError Could not interact with database
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       error: "ProjectNotFound"
 *     }
 */
router.put(
  "/:id",
  [
    check("currentIndex")
    .exists()
    .isInt(),
    sanitize("currentIndex").toInt()
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).send({
        error: "InvalidParameters"
      });
    }

    let current = req.body.current !== undefined ? req.body.current : true;

    Projects.findById(req.params.id, function (err, project) {
      if (err) {
        return res.status(500).send({
          error: "DatabaseError"
        });
      }

      if (project === null) {
        return res.status(404).send({
          error: "ProjectNotFound"
        });
      }

      project.set({
        currentIndex: req.body.currentIndex
      });

      project.save(async function (err, project) {
        if (err) return res.status(500).send("DatabaseError");

        if (current === true) {
          try {
            await ProjectHelper.setCurrentProject(req.params.id);
          } catch (error) {
            return res.status(500).send({
              error: "DatabaseError"
            });
          }
        }

        return res.status(200).send({
          project: project
        });
      });
    });
  }
);

/**
 *
 * @api {post} project/ Get a project current index
 * @apiName GetProjectIndex
 * @apiGroup Project
 * @apiVersion  1.0.0
 *
 * @apiParam {String} projectName
 * @apiParamExample {json} Input
 *    {
 *        projectName: "test"
 *    }
 *
 * @apiSuccess {Number} currentIndex project index
 * @apiSuccessExample {json} Success:
 *    HTTP/1.1 200 OK
 *    {
 *      currentIndex: 5
 *    }
 *
 * @apiError (500) DatabaseError Could not interact with database
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 Not Found
 *     {
 *       error: "DatabaseError"
 *     }
 */
router.post(
  "/currentIndex",
  [
    check("projectName")
    .exists()
    .isLength({
      min: 1
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        error: "InvalidParameters"
      });
    }

    try {
      return res.status(200).send({
        currentIndex: await ProjectHelper.getCurrentIndex(req.body.projectName)
      });
    } catch (error) {
      return res.status(500).send({
        error: "DatabaseError"
      });
    }
  }
);

/**
 *
 * @api {get} project/ Increment a project current index
 * @apiName IncrementProjectIndex
 * @apiGroup Project
 * @apiVersion  1.0.0
 *
 * @apiParam {String} id The project's id
 *
 * @apiSuccess {Number} currentIndex The new project's index
 * @apiSuccessExample {json} Success:
 *    HTTP/1.1 200 OK
 *    {
 *      currentIndex: 6
 *    }
 *
 * @apiError (404) ProjectNotFound The specified project does not exists
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       error: "ProjectNotFound"
 *     }
 */
router.post("/increment/", async (req, res) => {
  try {
    return res.status(200).send({
      currentIndex: await ProjectHelper.incrementCurrentIndex(req.body.id)
    });
  } catch (error) {
    return res.status(500).send({
      error: "ProjectNotFound"
    });
  }
});

module.exports = router;
