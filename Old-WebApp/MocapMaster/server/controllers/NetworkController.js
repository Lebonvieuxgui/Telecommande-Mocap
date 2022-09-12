const express = require("express");
const bodyParser = require("body-parser");

var io = require("socket.io")(9000, {
  pingInterval: 10000,
  pingTimeout: 5000
}).listen(9090);

var WatchJS = require("melanke-watchjs");
var watch = WatchJS.watch;

// Helpers
const NetworkHelper = require("../helpers/NetworkHelper");

// Router config
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

/**
 *
 * @api {get} /network/ip Request raspberry ip address
 * @apiName GetIpAddress
 * @apiGroup Network
 * @apiVersion  1.0.0
 *
 * @apiSuccess {String} ipAddress
 *
 * @apiSuccessExample {json} Success:
 *    HTTP/1.1 200 OK
 *    {
 *      ipAddress: 192.168.0.100
 *    }
 */
router.get("/ip", function(req, res) {
  return res.status(200).send({ ipAddress: NetworkHelper.ipAddress });
});

/**
 *
 * @api {get} /network/hostname Request raspberry hostname
 * @apiName GetHostname
 * @apiGroup Network
 * @apiVersion  1.0.0
 *
 * @apiSuccess {String} hostname
 *
 * @apiSuccessExample {json} Success:
 *    HTTP/1.1 200 OK
 *    {
 *      hostname: raspi
 *    }
 *
 * @apiError (500) SettingsFileNotFound The hostname could not be retrieved.
 *
 * @apiErrorExample {json} Error:
 *    HTTP/1.1 500 Internal Server Error
 */
router.get("/hostname", async function(req, res) {
  try {
    return res.status(200).send({ hostName: await NetworkHelper.hostname });
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

/**
 *
 * @api {get} /network/ Request raspberry network informations
 * @apiName GetInfos
 * @apiGroup Network
 * @apiVersion  1.0.0
 *
 * @apiSuccess {String} hostName
 * @apiSuccess {String} ipAddress
 *
 * @apiSuccessExample {json} Success:
 *    HTTP/1.1 200 OK
 *    {
 *      hostname: raspi,
 *      ipAddress: 192.168.0.100
 *    }
 *
 * @apiError (500) SettingsFileNotFound The informations could not be retrieved.
 *
 * @apiErrorExample {json} Error:
 *    HTTP/1.1 500 Internal Server Error
 */
router.get("/", async function(req, res) {
  try {
    return res.status(200).send({
      ipAddress: NetworkHelper.ipAddress,
      hostname: await NetworkHelper.hostname
    });
  } catch (error) {
    return res.status(500).send({ error: error });
  }
});

/**
 *
 * @api {get} /network/devices Request all devices connected to the local network.
 * @apiName GetDevices
 * @apiGroup Network
 * @apiVersion  1.0.0
 *
 * @apiSuccess {Object[]} devices
 * @apiSuccess {String} devices.ipAddress Device Ip Address
 * @apiSuccess {String} devices.type Device type, can be "Helmet" or "Master"
 * @apiSuccess {String} devices.hostname Device hostname
 * @apiSuccess {String} devices.helmetName Device helmet name, null if "type" is "Master"
 * @apiSuccess {String} devices.isRecording Device recording status, null if "type" is "Master"
 * @apiSuccess {String} devices.recordStartTs Start timestamp of current recording, null if "isRecording" is not true
 *
 * @apiSuccessExample {json} Success:
 *    HTTP/1.1 200 OK
 *    {
 *      "availableDevices": [
 *       {
 *          "ipAddress": "192.168.0.100",
 *          "type": "Helmet",
 *          "hostname": "test",
 *          "helmetName": "Helmet1",
 *          "isVisible": true,
 *          "isRecording": false,
 *          "recordStartTs": null
 *         }
 *      ]
 *    }
 *
 * @apiError (500) SettingsFileNotFound The hostname could not be retrieved.
 *
 * @apiErrorExample {json} Error:
 *    HTTP/1.1 500 Internal Server Error
 */
router.get("/devices", async function(req, res) {
  let network = require("../config/network");

  return res.status(200).send({ devices: network.devices });
});

io.on("connection", socket => {
  let state = require("../state");
  let connected = true;

  socket.emit("devices", JSON.stringify(state.connectedDevices));

  watch(state, "connectedDevices", function(prop) {
    if (connected === true && prop === "connectedDevices") {
      socket.emit("devices", JSON.stringify(state.connectedDevices));
    }
  });

  socket.on("disconnect", reason => {
    connected = false;
    socket.disconnect(true);
  });

  socket.on("error", error => {
    global.logger.logError(error);
  });
});

module.exports = router;
