<template>
  <el-row>
    <el-col :xs="24" :lg="12" class="settings">
      <el-form :model="settingsForm" :rules="rules" label-position="top" ref="settingsForm" label-width="120px">
        <el-form-item label="Name" prop="helmetName" class="top-label">
          <el-input v-model="settingsForm.helmetName" placeholder="helmetName" :disabled="settingsHelmetNameIsDisabled"></el-input>
        </el-form-item>
        <el-form-item label="Format" prop="formatName" class="top-label">
          <el-select v-model="settingsForm.formatName" placeholder="Select" :disabled="settingsAreDisabled">
            <el-option v-for="item in supportedFormats" :key="item.name" :label="item.name" :value="item.name" no-data-text="Undefined">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="post('settingsForm')" :disabled="settingsAreDisabled">Apply</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
  import Axios from "axios";
  import { Form, FormItem, Input, Select, Option, Button } from "element-ui";

  export default {
    components: {
      "axios": Axios,
      "el-form": Form,
      "el-form-item": FormItem,
      "el-input": Input,
      "el-select": Select,
      "el-option": Option,
      "el-button": Button
    },
    props: {
      devices: {}
    },
    data() {
      return {
        supportedFormats: [],
        settingsForm: {
          formatName: "",
          helmetName: ""
        },
        rules: {
          formatName: [
            {
              required: true,
              message: "Please choose a format",
              trigger: "blur"
            }
          ]
        }
      };
    },
    computed: {
      settingsHelmetNameIsDisabled: function() {
        if (this.devices.length !== 1) {
          return true;
        } else {
          this.devices.forEach(device => {
            if (device.isRecording === true) {
              return true;
            }
          });
        }

        return false;
      },
      settingsAreDisabled: function() {
        if (this.devices.length === 0) {
          return true;
        } else {
          this.devices.forEach(device => {
            if (device.isRecording === true) {
              return true;
            }
          });
        }

        return false;
      }
    },
    watch: {
      devices: function(devices) {
        if (devices.length === 1) {
          this.settingsForm.formatName = devices[0].format;
          this.settingsForm.helmetName = devices[0].helmetName;
        } else if (devices.length > 1) {
          this.settingsForm.helmetName = null;

          let format = devices[0].format;
          let diffFormat = false;

          devices.forEach(device => {
            if (format === null) {
              format = device.format;
            } else if (format !== device.format) {
              diffFormat = true;
            }
          });

          if (format === null || diffFormat === true) {
            this.settingsForm.formatName = "";
          } else {
            this.settingsForm.formatName = format;
          }
        } else {
          this.settingsForm.helmetName = null;
          this.settingsForm.formatName = "";
        }
      }
    },
    methods: {
      getSupportedFormats: function() {
        var self = this;

        Axios.get("/api/settings/formats")
          .then(function(response) {
            self.supportedFormats = response.data;
          })
          .catch(function(error) {
            console.error(error);
          });
      },
      post: function(formName) {
        var self = this;
        let error = null;

        const postAllSettings = async () => {
          await Promise.all(self.devices.map(async device => {
            Axios.post("http://" + device.ipAddress + ":3000/api/settings", {
              format: self.settingsForm.formatName,
              name: self.settingsForm.helmetName
            })
              .then(function(response) {
                Axios.get("http://" + device.ipAddress + ":3000/api/cam/end")
                  .then(function() {
                    Axios.get("http://" + device.ipAddress + ":3000/api/cam/start")
                      .then(function() {
                      })
                      .catch(function(err) {
                        error = err.response.error;
                      });
                  })
                  .catch(function(err) {
                    error = err.response.error;
                  });
              })
              .catch(function(err) {
                error = err.response.error;
              });
          }));
        };

        this.$refs[formName].validate(async valid => {
          if (valid) {
            await postAllSettings();

            if (error !== null) {
              self.$store.dispatch("setMessage", {
                content: error + " : settings could not be updated",
                type: "error"
              });
            } else {
              self.$store.dispatch("setMessage", {
                content: "Settings have been updated",
                type: "success"
              });
            }
          } else {
            return false;
          }
        });
      }
    },
    created() {
      this.getSupportedFormats();
    }
};
</script>

<style lang="less" scoped>
  .el-row {
    margin-top: 20px;
  }

  .settings {
    padding-left: 15px;
  }
</style>
