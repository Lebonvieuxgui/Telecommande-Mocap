const Projects = require("../data/Project.js");

/**
 *
 *
 * @class ProjectHelper
 */
class ProjectHelper {
  /**
   * Returns the currently selected project
   *
   * @static
   * @returns {Promise} The promise object represents the currently selected project
   * @memberof ProjectHelper
   */
  static getCurrentProject() {
    return new Promise((resolve, reject) => {
      let currentProject;

      Projects.find({}, (err, projects) => {
        if (err) {
          reject(err);
        }

        projects.some(project => {
          if (project.current === true) {
            if (currentProject !== undefined) {
              return true;
            }

            currentProject = project;
          }
        });

        resolve(currentProject !== undefined ? currentProject : null);
      });
    });
  }

  /**
   * Sets the passed project as the currently selected one
   *
   * @static
   * @param {Number} projectId The id of the new current project
   * @returns {Promise} Promise object returns nothing
   * @memberof ProjectHelper
   */
  static setCurrentProject(projectId) {
    return new Promise((resolve, reject) => {
      Projects.find({}, (err, projects) => {
        if (err) {
          reject(err);
        }

        projects.forEach(project => {
          if (projectId.toString() !== project._id.toString()) {
            project.set({ current: false });
          } else {
            project.set({ current: true });
          }

          project.save(function(err, project) {
            if (err) return reject(err);
          });
        });

        resolve();
      });
    });
  }

  /**
   * Returns the current index for a given project.
   *
   * @static
   * @param {String} projectName The project name.
   * @returns {Promise} The promise objects represents the project's current index
   * @memberof ProjectHelper
   */
  static getCurrentIndex(projectName) {
    return new Promise((resolve, reject) => {
      Projects.findOne({ name: projectName }, function(err, project) {
        if (err) {
          reject(err);
        }

        if (project === undefined || project === null) {
          resolve(0);
        } else {
          resolve(project.currentIndex || 0);
        }
      });
    });
  }

  /**
   * Increments the current index in the database for a given project.
   *
   * @static
   * @param {Number} projectId The project id.
   * @returns {Promise} The promise object represents the updated project's index
   * @memberof ProjectHelper
   */
  static incrementCurrentIndex(projectId) {
    return new Promise((resolve, reject) => {
      Projects.findById(projectId, function(err, project) {
        if (err) {
          reject(err);
        }

        if (project !== null) {
          // If project exists, increment its index
          if (!project.currentIndex) {
            project.currentIndex = 0;
          }

          project.currentIndex++;
          project.save(err => {
            if (err) {
              reject(err);
            }
          });

          resolve(project.currentIndex);
        }
      });
    });
  }
}

module.exports = ProjectHelper;
