<template>
  <el-row :gutter="20">
    <el-col :xs="24" :md="18">
      <div v-if="editedScript != null && scripts.length > 0 && editedScript.name === scripts[0].name" class="record-container">
        <helmet-record-parameters :sequence-name="recordForm.sequenceName" v-on:sequence-name="updateSequenceName" :take-index="recordForm.takeIndex" v-on:take-index="updateTakeIndex" :edited-script="scripts[0]" :selected-scripts="selectedScripts" :start-state="isStartRecordEnabled" :stop-state="isStopRecordEnabled" :global-fields-writable="areGlobalFieldsWritable" :devices="devices" :scripts="scripts" :global-filename="globalFilename" :key="editedScript.name" v-on:start-record="onStartRecord()" v-on:stop-record="onStopRecord()"></helmet-record-parameters>
      </div>
      <div v-else-if="editedScript != null" class="record-container">
        <script-record-parameters :sequence-name="recordForm.sequenceName" v-on:sequence-name="updateSequenceName" :take-index="recordForm.takeIndex" v-on:take-index="updateTakeIndex" :edited-script="editedScript" :selected-scripts="selectedScripts" :start-state="isStartRecordEnabled" :stop-state="isStopRecordEnabled" :global-fields-writable="areGlobalFieldsWritable" :devices="devices" :scripts="scripts" :global-filename="globalFilename" :key="editedScript.name" v-on:start-record="onStartRecord()" v-on:stop-record="onStopRecord()"></script-record-parameters>
      </div>
    </el-col>
    <el-col :xs="24" :md="6">
      <el-table :data="scripts" ref="scriptTable" height="270" style="width: 100%" @selection-change="selsChange" highlight-current-row @current-change="handleCurrentChange" :header-row-style="headerRowStyle()" v-loading="scriptsLoading">
        <el-table-column type="selection" min-width="15" class-name="clip-table-selectors">
        </el-table-column>
        <el-table-column prop="name" label="Scripts">
        </el-table-column>
        <el-table-column label="" min-width="30">
          <template slot-scope="scope">
            <font-awesome-icon v-if="isScriptReady(scripts[scope.$index]) === false" :icon="['fas', 'exclamation']" fixed-width class="operation-icon" />
            <font-awesome-icon v-else :icon="['fas', 'check']" fixed-width class="operation-icon" />
          </template>
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>
</template>

<script>
  import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
  import Axios from "axios";
  import Timer from "easytimer.js";
  import { mapGetters } from "vuex";
  import { Tooltip, Button, Input, InputNumber, Table, TableColumn, Dialog, Form, FormItem } from "element-ui";

  const ScriptRecordParameters = () => import("./ScriptRecordParameters.vue");
  const HelmetRecordParameters = () => import("./HelmetRecordParameters.vue");

  var numeral = require("numeral");

  export default {
    components: {
      "font-awesome-icon": FontAwesomeIcon,
      "el-tooltip": Tooltip,
      "el-button": Button,
      "el-input": Input,
      "el-input-number": InputNumber,
      "el-table": Table,
      "el-table-column": TableColumn,
      "el-dialog": Dialog,
      "el-form": Form,
      "el-form-item": FormItem,
      "script-record-parameters": ScriptRecordParameters,
      "helmet-record-parameters": HelmetRecordParameters
    },
    props: {
      devices: {}
    },
    data() {
      return {
        scriptsLoading: false,
        recordLoading: false,
        modalScript: null,
        scriptModalVisible: false,
        displayedDuration: "00:00:0",
        recordStartTs: null,
        editedScript: { name: "Helmet", variables: [{ name: "Sequence name", value: "" }, { name: "Take", value: 0 }] },
        duration: {
          milliseconds: 0,
          seconds: 0,
          minutes: 0
        },
        timers: [],
        selectedScripts: [],
        scripts: [],
        recordTimerTs: null,
        interval: null,
        timer: null,
        recordForm: {
          sequenceName: "",
          takeIndex: 0
        },
        sequenceIdentifier: 0,
        filters: {
          formatNumber: function(value) {
            return numeral(value).format("0,0");
          }
        },
        rules: {
          sequenceName: [
            {
              required: true,
              message: "Please enter a sequence name",
              trigger: "blur"
            },
            {
              min: 1,
              max: 20,
              message: "Length should be 1 to 20",
              trigger: "blur"
            }
          ],
          takeIndex: [
            {
              required: true,
              message: "Please enter a take index",
              trigger: "blur"
            }
          ]
        }
      };
    },
    computed: {
      ...mapGetters({ project: "project" }),
      globalFilename: function() {
        this.sequenceIdentifier;
        this.recordForm.sequenceName;
        this.recordForm.takeIndex;

        let record;
        let settings;

        for (let i = 0; i < this.devices.length; i++) {
          const device = this.devices[i];
          let testSettings = JSON.stringify(device.recordSettings);

          if (
            (record !== undefined && device.isRecording !== record) ||
              (settings !== undefined && testSettings !== settings)
          ) {
            return null;
          }

          record = device.isRecording;

          if (
            device.isRecording === true &&
            device.recordSettings !== undefined
          ) {
            settings = testSettings;
          }
        }

        if (record === true && settings !== undefined) {
          this.recordForm.sequenceName = this.devices[0].recordSettings.sequenceName;
        }

        if (this.recordForm.sequenceName === undefined || this.recordForm.sequenceName === null || this.recordForm.sequenceName === "") {
          return null;
        } else {
          return (this.project !== null ? this.project.name + "_" + ("000" + this.project.currentIndex).slice(-4) + "_" : "") + (this.recordForm.sequenceName != null ? this.recordForm.sequenceName : "null") + "" + ("00" + this.recordForm.takeIndex).slice(-3);
        }
      },
      areGlobalFieldsWritable: function() {
        if (this.areDevicesIdle === false && this.selectedScripts.includes(this.scripts[0])) {
          return false;
        }

        // if (this.editedScript.name !== "Helmet record") {
        //   this.editedScript.variables.forEach(variable => {
        //     if (variable.name === "$filename") {
        //       return true;
        //     }
        //   });
        //   return false;
        // } else {
        //   return true;
        // }
        return true;
      },
      isStartRecordEnabled: function() {
        if (this.selectedScripts.length === 0) {
          return false;
        }

        if ((this.devices.length === 0 || this.areDevicesIdle === false) && this.selectedScripts.includes(this.scripts[0])) {
          return false;
        }

        let ret = true;

        this.selectedScripts.forEach(script => {
          if (this.isScriptReadyToStart(script) === false) {
            ret = false;
          }
        });

        return ret;
      },
      isStopRecordEnabled: function() {
        if (this.selectedScripts.length === 0) {
          return false;
        }

        if ((this.devices.length === 0 || this.areDevicesRecording === false) && this.selectedScripts.includes(this.scripts[0])) {
          return false;
        }

        let ret = true;

        this.selectedScripts.forEach(script => {
          if (this.isScriptReadyToStop(script) === false) {
            ret = false;
          }
        });

        return ret;
      },
      areDevicesIdle: function() {
        for (let index = 0; index < this.devices.length; index++) {
          const device = this.devices[index];

          if (device.isRecording === true) {
            return false;
          }
        }

        return true;
      },
      areDevicesRecording: function() {
        for (let index = 0; index < this.devices.length; index++) {
          const device = this.devices[index];

          if (device.isRecording === false) {
            return false;
          }
        }

        return true;
      }
    },
    watch: {
      "recordForm.sequenceName": function(val) {
        this.scripts[0].variables[0].value = val;
      },
      "recordForm.takeIndex": function(val) {
        this.scripts[0].variables[1].value = val;
      }
    },
    methods: {
      updateSequenceName(val) {
        this.recordForm.sequenceName = val;
        this.globalFileName;
      },
      updateTakeIndex(val) {
        this.recordForm.takeIndex = val;
        this.globalFilename;
      },
      openConfirmMessage(message, confirmCallback) {
        const h = this.$createElement;

        this.$msgbox({
          title: "Warning",
          message: h("p", { style: "font-family: Poppins" }, [
            h("span", null, message)
          ]),
          showCancelButton: true,
          confirmButtonText: "OK",
          cancelButtonText: "Cancel",
          type: "warning"
        }).then(action => {
          confirmCallback();
        });
      },
      headerRowStyle: function(Obj) {
        return {
          color: "#47627F"
        };
      },
      timerCallback: function() {
        var diff = Date.now() - this.recordStartTs;

        let minutes = Math.floor(diff / 60000);

        diff = diff % 60000;

        let seconds = Math.floor(diff / 1000);

        diff = diff % 1000;

        let milliseconds = Math.floor(diff / 10);

        this.displayedDuration =
                ("0" + minutes).slice(-2) +
                ":" +
                ("0" + seconds).slice(-2) +
                ":" +
                ("" + milliseconds).slice(0, 1);
      },
      createTimer: function() {
        this.timer = new Timer();

        let recording;
        let synchronized = true;

        if (this.devices !== undefined && this.devices.length !== 0) {
          recording = true;

          let startTs = this.devices[0].recordStartTs;

          this.devices.forEach((device, index) => {
            if (device.isRecording === false) {
              recording = false;
            }

            if (device.recordStartTs === undefined) {
              synchronized = false;
            }

            let diff = device.recordStartTs - startTs;

            if (diff > 1000 || diff < -1000) {
              synchronized = false;
            }
          });
        }

        if (recording === true) {
          this.recordStartTs = this.devices[0].recordStartTs;
          this.timer.start({ precision: "secondTenths" });
          this.timer.addEventListener("secondTenthsUpdated", this.timerCallback);
        } else if (synchronized === false) {
          this.displayedDuration = "Not synchronized";
        }
      },
      removeTimer: function() {
        try {
          this.recordStartTs = null;
          this.displayedDuration = "00:00:0";
          this.timer.removeEventListener(
            "secondTenthsUpdated",
            this.timerCallback
          );
        } catch (error) {}
      },
      isScriptReady(script) {
        let ready = true;

        if (script.variables === undefined) {
          return true;
        }

        script.variables.forEach(variable => {
          if (((variable.value === null || variable.value === "") && variable.name !== "$filename") || (variable.name === "$filename" && this.globalFilename === null)) {
            ready = false;
          }
        });

        return ready;
      },
      isScriptReadyToStart(script) {
        if (script.startTokens === undefined) {
          return this.isScriptReady(script);
        }

        let ready = true;

        if (script.variables === undefined) {
          return true;
        }

        script.variables.forEach(variable => {
          script.startTokens.forEach(token => {
            if ((token.startsWith(variable.name) || token.endsWith(variable.name)) && ((variable.value === null && variable.name !== "$filename") || (variable.name === "$filename" && this.globalFilename === null))) {
              ready = false;
            }
          });
        });

        return ready;
      },
      isScriptReadyToStop(script) {
        if (script.stopTokens === undefined) {
          return this.isScriptReady(script);
        }

        let ready = true;

        if (script.variables === undefined) {
          return true;
        }

        script.variables.forEach(variable => {
          script.stopTokens.forEach(token => {
            if ((token.startsWith(variable.name) || token.endsWith(variable.name)) && ((variable.value === null && variable.name !== "$filename") || (variable.name === "$filename" && this.globalFilename === null))) {
              ready = false;
            }
          });
        });

        return ready;
      },
      selsChange: function(sels) {
        this.selectedScripts = sels;
      },
      handleCurrentChange(val) {
        this.editedScript = val;
      },
      getScripts: function() {
        let self = this;

        this.scriptsLoading = true;
        Axios.get("/api/scripts/")
          .then(response => {
            this.scriptsLoading = false;
            self.scripts = [];
            self.scripts.push({ name: "Helmet record", variables: [{ name: "Sequence name", value: this.recordForm.sequenceName }, { name: "Take", value: this.recordForm.takeIndex }] });
            self.scripts = self.scripts.concat(response.data.scripts);

            setTimeout(() => {
              self.$refs.scriptTable.toggleRowSelection(self.scripts[0]);
              self.$refs.scriptTable.setCurrentRow(self.scripts[0]);
            }, 50);
          })
          .catch(error => {
            this.scriptsLoading = false;
            self.$store.dispatch("setMessage", {
              content: error.response.error + " : could not get scripts",
              type: "error"
            });
          });
      },
      stopRecord: function() {
        var self = this;
        let error = null;

        return new Promise((resolve, reject) => {
          Promise.all(self.devices.map(device => {
            return new Promise((resolve, reject) => {
              Axios.get("http://" + device.ipAddress + ":3000/api/cam/stop_record")
                .then(function(response) {
                  resolve();
                })
                .catch(function(err) {
                  error = err.response.error;
                  resolve();
                });
            });
          })).then(() => {
            if (error === null) {
              self.$store.dispatch("setMessage", {
                content: "Helmet has stopped successfully",
                type: "success"
              });
              resolve(1);
            } else {
              self.$store.dispatch("setMessage", {
                content: error + " : error when stopping record",
                type: "error"
              });
              resolve(0);
            }
          });
        });
      },
      cancelRecord: function() {
        this.devices.forEach(device => {
          Axios.get("http://" + device.ipAddress + ":3000/api/cam/cancel_record")
            .then(function(response) {})
            .catch(function() {});
        });
      },
      startRecord: async function(force = false) {
        var self = this;
        let error = null;

        this.recordLoading = true;
        Promise.all(self.devices.map(device => {
          return new Promise((resolve, reject) => {
            Axios.post(
              "http://" + device.ipAddress + ":3000/api/cam/start_record",
              {
                sequenceName: self.recordForm.sequenceName,
                takeIndex: self.recordForm.takeIndex,
                sequenceIdentifier: self.sequenceIdentifier,
                force: force
              }
            )
              .then(function(response) {
                resolve();
              })
              .catch(function(err) {
                error = { status: err.response.status, message: err.response.error };
                resolve();
              });
          });
        })).then(() => {
          this.recordLoading = false;

          if (error === null) {
            self.$store.dispatch("setMessage", {
              content: "Helmet has started successfully",
              type: "success"
            });
          } else {
            self.cancelRecord();

            if (error.status === 409) {
              self.openConfirmMessage(
                "A clip with the same file name has been found, do you want to replace it ?",
                () => {
                  self.startRecord(true);
                }
              );
            } else {
              self.$store.dispatch("setMessage", {
                content: error + " : error when starting record",
                type: "error"
              });
            }
          }
        });
      },
      startScript: function(script) {
        script.variables.forEach(v => {
          if (v.name === "$filename") {
            v.value = this.globalFilename;
          }
        });
        console.log({ scripts: [{ id: script._id, variables: script.variables }] });
        Axios.post("/api/scripts/start", { scripts: [{ id: script._id, variables: script.variables }] })
          .then(response => {
            this.$store.dispatch("notify", {
              title: script.name,
              desc: " has started successfully.",
              type: "success",
              duration: 0
            });
          })
          .catch(() => {
            this.$store.dispatch("notify", {
              title: script.name,
              desc: " has not started successfully.",
              type: "error",
              duration: 4500
            });
          });
      },
      stopScript: function(script) {
        return new Promise((resolve, reject) => {
          script.variables.forEach(v => {
            if (v.name === "$filename") {
              v.value = this.globalFilename;
            }
          });
          Axios.post("/api/scripts/stop", { scripts: [{ id: script._id, variables: script.variables }] })
            .then(response => {
              this.$store.dispatch("notify", {
                title: script.name,
                desc: " has stopped successfully.",
                type: "success",
                duration: 0
              });
              resolve(1);
            })
            .catch(() => {
              this.$store.dispatch("notify", {
                title: script.name,
                desc: " has not stopped successfully.",
                type: "error",
                duration: 4500
              });
              resolve(0);
            });
        });
      },
      onStartRecord: function() {
        this.selectedScripts.forEach(async element => {
          if (element.name === "Helmet record") {
            await this.startRecord();
          } else {
            await this.startScript(element);
          }
        });
      },
      onStopRecord: function() {
        let successes = 0;

        Promise.all(this.selectedScripts.map(async element => {
          return new Promise(async (resolve, reject) => {
            if (element.name === "Helmet record") {
              successes += await this.stopRecord();
              resolve();
            } else {
              successes += await this.stopScript(element);
              resolve();
            }
          });
        })).then(() => {
          console.log("STOP RECORD");
          console.log(successes);

          if (successes > 0) {
            let self = this;

            this.recordForm.takeIndex++;

            Axios.post(
              "/api/project/increment",
              {
                id: this.project._id
              }
            ).then(response => {
              self.$store.state.project.currentIndex++;
              self.sequenceIdentifier = response.data.currentIndex;
            });
          }
        });
      }
    },
    mounted() {
      this.getScripts();
    }
  };
</script>

<style lang="less" scoped>
  @import "../styles/styles.less";

  .record-container {
    margin-bottom: -10px;
  }
</style>
