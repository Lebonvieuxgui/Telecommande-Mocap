import Vue from "vue";
import Vuex from "vuex";
import Axios from "axios";
import io from "socket.io-client";
import moment from "moment";

Vue.use(Vuex);

// root state object.
// each Vuex instance is just a single state tree.
const state = {
  leftbarIsCollapsed: undefined,
  rightbarIsCollapsed: true,
  ipAddress: undefined,
  hostname: undefined,
  devices: [],
  notifications: [],
  message: null,
  notified: [],
  hasUnseenNotifications: false,
  project: null
};

// mutations are operations that actually mutates the state.
// each mutation handler gets the entire state tree as the
// first argument, followed by additional payload arguments.
// mutations must be synchronous and can be recorded by plugins
// for debugging purposes.
const mutations = {
  toggleLeftbar(state) {
    state.leftbarIsCollapsed = !state.leftbarIsCollapsed;
  },
  toggleRightbar(state) {
    state.rightbarIsCollapsed = !state.rightbarIsCollapsed;
  },
  setToggleRightbar(state, boolean) {
    state.rightbarIsCollapsed = boolean;
  },
  duplicate(state) {
    state.devices.push(state.devices[0]);
  },
  clearNotifications(state) {
    state.notifications = [];
  },
  notify(state, notification) {
    state.notifications.push(notification);
    state.notified.push({
      title: notification.title,
      content: notification.desc,
      type: notification.type || "default",
      time: moment().format("LTS")
    });
  },
  setMessage(state, message) {
    state.message = message;
    state.notified.push({
      title: "",
      content: message.content,
      type: message.type,
      time: moment().format("LTS")
    });
  },
  setHasUnseenNotifications(state, boolean) {
    state.hasUnseenNotifications = boolean;
  },
  setProject(state, project) {
    state.project = project;
  }
};

// actions are functions that cause side effects and can involve
// asynchronous operations.
const actions = {
  toggleLeftbar: ({ commit }) => commit("toggleLeftbar"),
  toggleRightbar: ({ commit }) => commit("toggleRightbar"),
  setToggleRightbar: ({ commit }, boolean) => commit("toggleRightbar", boolean),
  duplicate: ({ commit }) => commit("duplicate"),
  clearNotifications: ({ commit }) => commit("clearNotifications"),
  notify: ({ commit }, notification) => commit("notify", notification),
  setMessage: ({ commit }, message) => commit("setMessage", message),
  setHasUnseenNotifications: ({ commit }, boolean) =>
    commit("setHasUnseenNotifications", boolean),
  setProject: ({ commit }, project) => commit("setProject", project)
};

// getters are functions
const getters = {
  leftbarIsCollapsed: state => state.leftbarIsCollapsed,
  rightbarIsCollapsed: state => state.rightbarIsCollapsed,
  devices: state => state.devices,
  notifications: state => state.notifications,
  message: state => state.message,
  notified: state => state.notified,
  hasUnseenNotifications: state => state.hasUnseenNotifications,
  hostname: state => state.hostname,
  project: state => state.project
};

function getLeftbarStatus() {
  if (window.innerWidth < 767) {
    state.leftbarIsCollapsed = true;
  } else {
    state.leftbarIsCollapsed = false;
  }
}

function getIpAddress() {
  Axios.get("api/network/").then(function(response) {
    state.ipAddress = response.data.ipAddress;
    state.hostname = response.data.hostname;
    createWebSocket();
  });
}

function getCurrentProject() {
  Axios.get("api/project/current").then(function(response) {
    if (response.data.project !== undefined) {
      state.project = response.data.project;
    }
  });
}

function createWebSocket() {
  let initializing = true;
  var socket = io.connect(
    "http://" + state.ipAddress + ":9090/",
    {
      reconnection: true
    }
  );

  socket.on("connect", sock => {
    socket.emit("deviceType", "Client");
    socket.emit("infos", {
      type: "Client",
      hostname: undefined,
      isVisible: false
    });

    socket.on("devices", async function(data) {
      let datas = null;

      try {
        datas = JSON.parse(data);
      } catch (error) {
        console.error(error);
      }

      if (!initializing && (state.devices.length > 0 || datas.length > 0)) {
        let devices = [];

        state.devices.forEach(device => {
          devices.push(JSON.parse(JSON.stringify(device)));
        });

        let newDevices = JSON.parse(JSON.stringify(datas));

        for (let i = 0; i < devices.length; i++) {
          const device = devices[i];
          let x = isAtIndex(newDevices, device);

          if (x !== -1) {
            devices.splice(i, 1);
            newDevices.splice(x, 1);
            i--;
          }
        }

        devices.forEach(device => {
          if (device.hostname !== undefined) {
            state.notifications.push({
              title: device.hostname,
              desc: " has disconnected"
            });
            state.notified.push({
              title: device.hostname,
              content: " has disconnected",
              type: "default",
              time: moment().format("LTS")
            });
          }
        });

        newDevices.forEach(device => {
          if (device.hostname !== undefined) {
            state.notifications.push({
              title: device.hostname,
              desc: " has connected"
            });
            state.notified.push({
              title: device.hostname,
              content: " has connected",
              type: "default",
              time: moment().format("LTS")
            });
          }
        });
      }

      initializing = false;

      for (let i = 0; i < datas.length; i++) {
        const element = datas[i];

        element.notified = false;

        if (!element.hostname) {
          datas.splice(i, 1);
          i--;
        } else {
          element.timer = "00:00";
        }
      }

      state.devices = datas;
    });

    socket.on("disconnect", function(reason) {
      state.message = {
        content: "Server disconnected : " + reason,
        type: "error"
      };
    });

    socket.on("error", error => {
      console.error(error);
    });
  });
}

function isAtIndex(array, it) {
  for (let index = 0; index < array.length; index++) {
    const element = array[index];

    if (it.ipAddress === element.ipAddress) {
      return index;
    }
  }

  return -1;
}

getLeftbarStatus();
getIpAddress();
getCurrentProject();

// A Vuex instance is created by combining the state, mutations, actions,
// and getters.
export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations
});
