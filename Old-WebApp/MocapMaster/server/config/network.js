const { exec } = require("child_process");
const NetworkHelper = require("../helpers/NetworkHelper");
const appRoot = require("app-root-path");
const logger = require(appRoot + "/server/config/winston.js");
const WatchJS = require("melanke-watchjs");
const callWatchers = WatchJS.callWatchers;

let state = require("../state");

let find = function(ipAddress) {
  let i = this.length;

  while (i--) {
    if (this[i].ipAddress === ipAddress) {
      return i;
    }
  }

  return -1;
};

class Network {
  async connectToServer(ip) {
    let io = require("socket.io-client");
    let socket = io.connect(
      "http://" + ip + ":8080/",
      {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity
      }
    );

    socket.on("connect", async sock => {
      let address = ip;

      if (find.call(state.connectedDevices, address) !== -1) {
        socket.disconnect(true);
      } else {
        logger.logInfo("Connected to server");

        state.connectedDevices.push({
          ipAddress: address,
          type: undefined,
          hostname: undefined,
          helmetName: undefined,
          isVisible: false
        });

        socket.emit("infos", {
          type: "Master",
          hostname: await NetworkHelper.hostname,
          helmetName: "Master",
          isRecording: false,
          recordStartTs: null,
          isVisible: true
        });

        socket.on("infos", function(data) {
          let index = find.call(state.connectedDevices, address);

          if (index !== -1) {
            state.connectedDevices[index] = {
              ipAddress: state.connectedDevices[index].ipAddress,
              type: data.type,
              hostname: data.hostname,
              helmetName: data.helmetName,
              format: data.format,
              isVisible: data.isVisible,
              isRecording: data.isRecording,
              recordStartTs: data.recordStartTs,
              storage: data.storage
            };

            try {
              callWatchers(state, "connectedDevices");
            } catch (error) {}
          }
        });

        socket.on("settings", function(data) {
          let index = find.call(state.connectedDevices, address);

          if (index !== -1) {
            state.connectedDevices[index].helmetName = data.name;
            state.connectedDevices[index].format = data.format;

            try {
              callWatchers(state, "connectedDevices");
            } catch (error) {}
          }
        });

        socket.on("recording", function(data) {
          let index = find.call(state.connectedDevices, address);

          if (index !== -1) {
            state.connectedDevices[index].isRecording = data.isRecording;
            state.connectedDevices[index].recordStartTs = data.recordStartTs;
            state.connectedDevices[index].recordSettings = {
              sequenceName: data.recordSettings.sequenceName,
              takeIndex: data.recordSettings.takeIndex
            };

            try {
              callWatchers(state, "connectedDevices");
            } catch (error) {}
          }
        });

        socket.on("storage", function(data) {
          let index = find.call(state.connectedDevices, address);

          if (index !== -1) {
            if (
              JSON.stringify(data) !==
              JSON.stringify(state.connectedDevices[index].storage)
            ) {
              state.connectedDevices[index].storage = data;

              try {
                callWatchers(state, "connectedDevices");
              } catch (error) {}
            }
          }
        });

        socket.on("disconnect", function(reason) {
          const index = find.call(state.connectedDevices, address);

          if (index > -1) {
            state.connectedDevices.splice(index, 1);
          }

          try {
            callWatchers(state, "connectedDevices");
          } catch (error) {}

          logger.logInfo("Server disconnected (" + reason + ").");

          // socket.disconnect(false);
        });

        socket.on("error", error => {
          console.error(error);
        });
      }
    });
  }

  async connectToAll() {
    let IPs = [];

    // Execute a local network scan and try to connect to all devices found
    exec("sudo arp-scan --localnet", (err, stdout, stderr) => {
      if (err) {
        console.error(err);
      } else {
        let res = stdout.split("\n");

        res.forEach(ip => {
          if (ip.startsWith("192")) {
            IPs.push(ip.split("\t")[0]);
          }
        });

        IPs.forEach(ip => {
          this.connectToServer(ip);
        });
      }
    });
  }

  async launchServer() {
    let io = require("socket.io")(8000, {
      pingInterval: 2000,
      pingTimeout: 1000
    }).listen(8080);

    // On successful connection
    io.on("connection", socket => {
      let address = socket.handshake.address.split(":")[3];

      // If a device with the same IP address has already established a connection, disconnect the new one
      if (find.call(state.connectedDevices, address) !== -1) {
        socket.disconnect(true);
      } else {
        logger.logInfo("Connected to Client");

        state.connectedDevices.push({
          ipAddress: address,
          type: undefined,
          hostname: undefined,
          helmetName: undefined,
          isVisible: false
        });
        // When receiving informations from client, update its object
        socket.on("infos", async data => {
          socket.emit("infos", {
            type: "Master",
            hostname: await NetworkHelper.hostname,
            helmetName: "Master",
            isRecording: false,
            recordStartTs: null,
            isVisible: true
          });

          let index = find.call(state.connectedDevices, address);

          if (index !== -1) {
            state.connectedDevices[index] = {
              ipAddress: state.connectedDevices[index].ipAddress,
              type: data.type,
              hostname: data.hostname,
              helmetName: data.helmetName,
              format: data.format,
              isVisible: data.isVisible,
              isRecording: data.isRecording,
              recordStartTs: data.recordStartTs,
              storage: data.storage
            };

            try {
              callWatchers(state, "connectedDevices");
            } catch (error) {}
          }
        });

        socket.on("settings", function(data) {
          let index = find.call(state.connectedDevices, address);

          if (index !== -1) {
            state.connectedDevices[index].helmetName = data.name;
            state.connectedDevices[index].format = data.format;

            try {
              callWatchers(state, "connectedDevices");
            } catch (error) {}
          }
        });

        socket.on("recording", function(data) {
          let index = find.call(state.connectedDevices, address);

          if (index !== -1) {
            state.connectedDevices[index].isRecording = data.isRecording;
            state.connectedDevices[index].recordStartTs = data.recordStartTs;
            state.connectedDevices[index].recordSettings = {
              sequenceName: data.recordSettings.sequenceName,
              takeIndex: data.recordSettings.takeIndex
            };

            try {
              callWatchers(state, "connectedDevices");
            } catch (error) {}
          }
        });

        socket.on("storage", function(data) {
          let index = find.call(state.connectedDevices, address);

          if (index !== -1) {
            if (
              JSON.stringify(data) !==
              JSON.stringify(state.connectedDevices[index].storage)
            ) {
              state.connectedDevices[index].storage = data;

              try {
                callWatchers(state, "connectedDevices");
              } catch (error) {}
            }
          }
        });

        // On client disconnection, remove the client from the device list
        socket.on("disconnect", reason => {
          const index = find.call(state.connectedDevices, address);

          if (index > -1) {
            state.connectedDevices.splice(index, 1);
          }

          try {
            callWatchers(state, "connectedDevices");
          } catch (error) {}

          logger.logInfo("Client disconnected (" + reason + ").");
          // socket.disconnect(false);
        });

        socket.on("error", error => {
          logger.logError(error);
        });
      }
    });
  }

  emitToAll(type, message) {
    state.connectedDevices.forEach(device => {
      device.socket.emit(type, message);
    });
  }
}

let network = new Network();

network.launchServer();
setTimeout(() => {
  network.connectToAll();
}, 2000);

exports.devices = state.connectedDevices;
