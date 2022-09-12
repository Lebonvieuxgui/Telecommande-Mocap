<template>
  <div>
    <el-row>
      <el-col :sm="24" :xl="devicesXlCol">
        <el-table class="device-table" ref="deviceTable" height="315" :data="devices" empty-text="No device" @selection-change="selsChange" :header-row-style="headerRowStyle()" :header-cell-style="headerRowStyle()" :row-style="rowStyle" :cell-style="cellStyle">
          <el-table-column fixed prop="notified" label="" width="4">
          </el-table-column>
          <el-table-column fixed type="selection" min-width="15" class-name="clip-table-selectors">
          </el-table-column>
          <el-table-column fixed prop="helmetName" label="Helmet Name" min-width="120">
          </el-table-column>
          <el-table-column prop="hostname" label="System Name" min-width="120">
          </el-table-column>
          <el-table-column prop="ipAddress" label="IP Address" min-width="100">
          </el-table-column>
          <el-table-column prop="storage.freeSpace" label="Free Storage" min-width="120">
          </el-table-column>
          <el-table-column prop="timer" label="Status" min-width="70">
            <template slot-scope="scope">
              <font-awesome-icon v-if="devices[scope.$index].isRecording !== true" :icon="['fas', 'circle']" class="record-status" fixed-width />
              <font-awesome-icon v-else :icon="['fas', 'circle']" class="record-status recording" fixed-width />
              <span v-if="devices[scope.$index].isRecording === true">{{devices[scope.$index].timer}}</span>
            </template>
          </el-table-column>
          <el-table-column label="Operations" min-width="80">
            <template slot-scope="scope">
              <button class="button" @click="notify(scope.$index)">
                <font-awesome-icon :icon="['fas', 'bell']" fixed-width />
              </button>
              <button class="button" v-clipboard:copy="devices[scope.$index].ipAddress + ':3000/'">
                <font-awesome-icon :icon="['fas', 'copy']" fixed-width />
              </button>
              <a class="button" :href="'http://' + devices[scope.$index].ipAddress + ':3000/'">
                <font-awesome-icon :icon="['fas', 'external-link-alt']" fixed-width />
              </a>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <el-col :sm="24" :xl="devicesXlCol" class="bottom-table-tools">
      <el-tabs type="border-card">
        <el-tab-pane>
          <div slot="label">
            <font-awesome-icon class="tab-icon" :icon="['fas', 'circle']" fixed-width /> Record
          </div>
          <record-control :devices="sels"></record-control>
        </el-tab-pane>
        <el-tab-pane>
          <div slot="label">
            <font-awesome-icon class="tab-icon" :icon="['fas', 'cog']" fixed-width /> Settings
          </div>
          <settings :devices="sels"></settings>
        </el-tab-pane>
        <el-tab-pane>
          <div slot="label">
            <font-awesome-icon class="tab-icon" :icon="['fas', 'play-circle']" fixed-width /> Stream
          </div>
          <streams-player :devices="sels"></streams-player>
        </el-tab-pane>
      </el-tabs>
    </el-col>
  </div>
</template>

<script>
  import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
  import { mapGetters } from "vuex";
  import Timer from "easytimer.js";
  import { Table, TableColumn, Tabs, TabPane, Form, FormItem, Input, Select, Button, Option } from "element-ui";

  const RecordControl = () => import("./RecordControl.vue");
  const StreamsPlayer = () => import("./StreamsPlayer.vue");
  const Settings = () => import("./Settings.vue");

  export default {
    components: {
      "font-awesome-icon": FontAwesomeIcon,
      "record-control": RecordControl,
      "streams-player": StreamsPlayer,
      "settings": Settings,
      "el-table": Table,
      "el-table-column": TableColumn,
      "el-tabs": Tabs,
      "el-tab-pane": TabPane,
      "el-form": Form,
      "el-form-item": FormItem,
      "el-input": Input,
      "el-select": Select,
      "el-button": Button,
      "el-option": Option
    },
    data() {
      return {
        ignoreNextSelsUpdate: false,
        sels: []
      };
    },
    watch: {
      devices: function(val) {
        this.ignoreNextSelsUpdate = true;
      }
    },
    computed: {
      ...mapGetters({
        devices: "devices",
        rightBarIsCollapsed: "rightBarIsCollapsed"
      }),
      devicesXlCol: function() {
        return this.$store.state.rightbarIsCollapsed ? 18 : 24;
      }
    },
    methods: {
      duplicate: function(index) {
        this.$store.dispatch("duplicate");
      },
      toggleSelection(rows) {
        if (rows) {
          rows.forEach(row => {
            this.$refs.deviceTable.toggleRowSelection(row);
          });
        } else {
          this.$refs.deviceTable.clearSelection();
        }
      },
      getReferencedDevice: function(sel) {
        for (let index = 0; index < this.devices.length; index++) {
          const device = this.devices[index];

          if (sel.ipAddress === device.ipAddress) {
            return device;
          }
        }
      },
      selsChange: function(sels) {
        if (
          this.ignoreNextSelsUpdate === true &&
          this.sels.length !== 0 &&
          sels.length === 0
        ) {
          let list = [];

          for (let index = 0; index < this.sels.length; index++) {
            const sel = this.sels[index];

            list.push(this.getReferencedDevice(sel));
          }

          this.toggleSelection(list);
          this.ignoreNextSelsUpdate = false;
        } else {
          this.sels = sels;
        }
      },
      notify: function(deviceIndex) {
        this.devices[deviceIndex].notified = true;

        setTimeout(() => {
          this.devices[deviceIndex].notified = false;
        }, 2000);
      },
      headerRowStyle: function(Obj) {
        return {
          "background-color": "#f5f7fa",
          color: "#47627F"
        };
      },
      rowStyle: function(Obj) {
        return {
          padding: "5px 0px 5px 0px",
          color: "#47627F"
        };
      },
      cellStyle: function(obj) {
        if (obj.row.notified === true && obj.columnIndex === 0) {
          return {
            "background-color": "#e46a3e"
          };
        }
      }
    },
    mounted() {
      var timer = new Timer();

      let self = this;

      timer.start();
      timer.addEventListener("secondsUpdated", function(e) {
        if (self.devices !== undefined) {
          self.devices.forEach(device => {
            if (device.isRecording === true) {
              var diff = Date.now() - device.recordStartTs;

              let minutes = Math.floor(diff / 60000);

              diff = diff % 60000;

              let seconds = Math.floor(diff / 1000);

              device.timer =
                ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2);
            } else {
              device.timer = "00:00";
            }
          });
        }
      });
    }
  };
</script>

<style lang="less" scoped>
  @import "../styles/styles.less";

  .el-col {
    transition: all 0.3s;
  }

  .device-table {
    border: 1px solid #dcdfe6;
    box-shadow: 0 2px 4px 0 fadeout(@shadow-color, 88),
      0 0 6px 0 fadeout(@shadow-color, 96%);
  }

  .record-status {
    color: lighten(@default-dark-font-color, 50%);

    &.recording {
      color: @button-danger-color;
    }
  }

  button.button {
    background-color: inherit;
    color: @default-dark-font-color;
    border: 0;
    border-radius: 5px;
    padding: 4px 6px 3px 6px;
    cursor: pointer;
  }

  a.button {
    text-decoration: none;

    border-radius: 5px !important;

    background-color: inherit;
    color: @default-dark-font-color;
    padding: 5px 5px 3px 6px;
    cursor: pointer;
  }

  .bottom-table-tools {
    margin-top: 15px;

    .tab-icon {
      padding-top: 13px;
    }
  }

  .top-label {
    max-width: 250px;
  }

  .settings {
    padding-left: 15px;
  }
</style>
