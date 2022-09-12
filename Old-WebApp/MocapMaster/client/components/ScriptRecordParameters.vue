<template>
  <div>
    <el-row>
      <el-col :span="24">
        <!-- <el-row class="record-controls">
          <el-row>
            <el-col :xs="24" :sm="8">
              <div class="record-controls-label">Start command preview</div>
            </el-col>
            <el-col :xs="24" :sm="16">
              <div class="record-controls-value">
                {{ displayedScriptCall.start }}
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :xs="24" :sm="8">
              <div class="record-controls-label">Stop command preview</div>
            </el-col>
            <el-col :xs="24" :sm="16">
              <div class="record-controls-value">
                {{ displayedScriptCall.stop }}
              </div>
            </el-col>
          </el-row>
        </el-row> -->
      </el-col>
    </el-row>
    <el-row class="global-variables-row">
      <el-col :span="24">
        <div class="record-field">
          <el-row>
            <el-col :xs="16" :sm="8" :md="5" :lg="5">
              <div class="record-label">Sequence</div>
            </el-col>
            <el-col :xs="24" :sm="16" :md="9" :lg="11">
              <div class="record-input">
                <el-input v-model="sq" :disabled="!globalFieldsWritable"></el-input>
              </div>
            </el-col>
            <el-col :xs="24" :sm="8" :md="4" :lg="4">
              <div class="record-label">Take</div>
            </el-col>
            <el-col :xs="24" :sm="16" :md="6" :lg="4">
              <div class="record-input">
                <el-input-number v-model="tk" :disabled="!globalFieldsWritable" controls-position="right" :min="0" :max="999"></el-input-number>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :xs="24" :sm="5">
        <div class="actions">
          <div>
            <el-tooltip class="item" effect="dark" content="Start record" placement="top">
              <el-button v-on:click="onStartRecord()" type="danger" :disabled="!startState">
                <font-awesome-icon :icon="['fas', 'circle']" fixed-width />
              </el-button>
            </el-tooltip>
          </div>
          <div>
            <el-tooltip class="item" effect="dark" content="Stop record" placement="bottom">
              <el-button v-on:click="onStopRecord()" type="primary" :disabled="!stopState">
                <font-awesome-icon :icon="['fas', 'square']" fixed-width />
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="19">
        <div class="record-field">
          <el-row v-for="variable, index in editedScript.variables" :key="index">
            <el-col :xs="24" :sm="9">
              <div class="record-label">{{ variable.name.substring(1) | capitalize }}</div>
            </el-col>
            <el-col :xs="24" :sm="15">
              <div class="record-input">
                <el-input v-if="variable.name === '$filename'" :disabled="true" v-model="globalFilename"></el-input>
                <el-input v-else v-model="variable.value"></el-input>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
import { Tooltip, Button, Input, InputNumber } from "element-ui";

export default {
  components: {
    "font-awesome-icon": FontAwesomeIcon,
    "el-tooltip": Tooltip,
    "el-button": Button,
    "el-input": Input,
    "el-input-number": InputNumber
  },
  props: {
    editedScript: {
      type: Object,
      default: null
    },
    selectedScripts: {
      type: Array,
      default: []
    },
    devices: {
      type: Array,
      default: []
    },
    scripts: {
      type: Array,
      default: []
    },
    globalFilename: {
      type: String,
      default: null
    },
    stopState: {
      type: Boolean,
      default: false
    },
    startState: {
      type: Boolean,
      default: false
    },
    sequenceName: {
      type: String,
      default: null
    },
    takeIndex: {
      type: Number,
      default: 0
    },
    globalFieldsWritable: {
      type: Boolean,
      default: 0
    }
  },
  data() {
    return {
      displayedScriptCall: { "start": this.getDisplayedScriptCall(true), "stop": this.getDisplayedScriptCall(false) }
    };
  },
  computed: {
    sq: {
      get: function() {
        return this.sequenceName;
      },
      set: function(value) {
        this.$emit("sequence-name", value);
      }
    },
    tk: {
      get: function() {
        return this.takeIndex;
      },
      set: function(value) {
        this.$emit("take-index", value);
      }
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
  methods: {
    getDisplayedScriptCall: function(start) {
      let scriptCall = "";

      let scriptTokens;
      let scriptVars;

      scriptVars = this.editedScript.variables;

      if (start === true) {
        scriptTokens = this.editedScript.startTokens;
      } else {
        scriptTokens = this.editedScript.stopTokens;
      }

      scriptCall += "./" + this.editedScript.executableName;

      if (scriptTokens !== undefined) {
        for (let i = 0; i < scriptTokens.length; i++) {
          const token = scriptTokens[i];

          let variable = null;

          if (token === "$filename") {
            variable = " " + (this.globalFilename ? this.globalFilename : "");
          } else {
            scriptVars.forEach(v => {
              let re = new RegExp("[$]" + v.name.substring(1) + "$", "i");

              let match = token.match(re);

              if (match != null) {
                variable = " " +
                token.slice(0, match.index) + "\"" +
                ((v.name === "$filename") ? (this.globalFilename ? this.globalFilename : "") : (v.value ? v.value : "")) + "\"";
              }
            });
          }

          if (variable === null) {
            scriptCall += " " + token;
          } else {
            scriptCall += variable;
          }
        }
      }

      return scriptCall;
    },
    onStartRecord: function() {
      this.$emit("start-record", null);
    },
    onStopRecord: function() {
      this.$emit("stop-record", null);
    }
  },
  watch: {
    editedScript: {
      handler: function(val) {
        this.displayedScriptCall.start = this.getDisplayedScriptCall(true);
        this.displayedScriptCall.stop = this.getDisplayedScriptCall(false);
      },
      deep: true
    },
    globalFilename: {
      handler: function(val) {
        this.displayedScriptCall.start = this.getDisplayedScriptCall(true);
        this.displayedScriptCall.stop = this.getDisplayedScriptCall(false);
      }
    }
  },
  filters: {
    capitalize: function(value) {
      if (!value) return "";
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
  }
};
</script>

<style lang="less" scoped>
  @import "../styles/styles.less";

  div {
    color: @default-dark-font-color;

    .global-variables-row {
      margin-bottom: 20px;
    }

    .record-controls {
      width: 100%;
      margin-bottom: 20px;

      @media (min-width: 768px) {
        box-shadow: fadeout(@shadow-color, 85%) 0 0 7px 0;
      }

      .record-controls-label {
        background-color: #f5f7fa;
        color: lighten(@default-dark-font-color, 10%);
        padding-left: 10px;
        overflow: hidden;

        @media (max-width: 767px) {
          height: 30px;
          line-height: 30px;
          width: 60%;
          margin-top: 5px;
        }

        @media (min-width: 768px) {
          height: 46px;
          line-height: 46px;
        }
      }

      .record-controls-value {
        height: 40px;
        line-height: 40px;
        padding: 3px;
        padding-left: 25px;
        padding-right: 25px;
        overflow: auto;

        @media (max-width: 767px) {
          box-shadow: fadeout(@shadow-color, 85%) 0 0 7px 0;
        }
      }
    }

    .record-field {
      @media (min-width: 768px) {
        box-shadow: fadeout(@shadow-color, 85%) 0 0 7px 0;
      }

      .record-label {
        background-color: #f5f7fa;
        color: lighten(@default-dark-font-color, 10%);
        padding-left: 10px;

        @media (max-width: 767px) {
          height: 30px;
          line-height: 30px;
          width: 60%;
          margin-top: 5px;
        }

        @media (min-width: 768px) {
          height: 46px;
          line-height: 46px;
        }
      }

      .record-input {
        background-color: lighten(@primary-color-4, 5%);
        padding: 3px;

        @media (max-width: 767px) {
          box-shadow: fadeout(@shadow-color, 85%) 0 0 7px 0;
        }

        div {
          width: 100%;
        }
      }
    }

    .actions {
      @media (max-width: 767px) {
        margin-bottom: 15px;
        background-color: #f5f7fa;
        padding: 5px;
        text-align: center;
      }

      @media (min-width: 768px) {
        box-shadow: fadeout(@shadow-color, 85%) 0 0 7px 0;
        width: 100%;
        height: 92px;
        display: inline-block;
        text-align: center;
        margin-bottom: 20px;
      }

      div {
        display: inline-block;
        margin-right: 5px;
        margin-left: 5px;

        .item {
          @media (max-width: 767px) {
            font-size: 1.3em;
            padding: 10px !important;
          }

          @media (min-width: 768px) {
            height: 46px;
            font-size: 1.3em;
            padding: 0px 10px 0px 10px !important;
            margin-top: 23px;
            margin-left: 0;
          }
        }
      }
    }

    .operation-button {
      padding: 0;

      .operation-icon {
        color: @default-dark-font-color;
      }
    }
  }
</style>
