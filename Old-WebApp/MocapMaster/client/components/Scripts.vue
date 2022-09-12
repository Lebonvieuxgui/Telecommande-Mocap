<template>
  <div>
    <el-row :gutter="20">
      <el-col :md="8" :xl="leftXlSize">
        <div class="scripts-list">
          <div class="scripts-list-title">
            <el-button @click="refresh()" type="text">
              <font-awesome-icon :icon="['fas', 'sync']" fixed-width class="nav-icon" />
            </el-button>
            <el-button @click="addScript()" type="text" :disabled="!isAddButtonEnabled">
              <font-awesome-icon :icon="['fas', 'plus']" fixed-width class="nav-icon" />
            </el-button>
          </div>
          <ul v-if="scripts.length != 0">
            <li class="script-item" v-for="script in scripts" :key="script._id" @click="selectScript(script)" :class="{active: isActive(script.name)}">
              <span v-if="script.name !== null">{{script.name}}</span>
              <span v-else>New script</span>
              <el-tag v-if="script.isNew !== undefined" class="new-disclaimer" type="info">NEW</el-tag>
            </li>
          </ul>
          <div v-else>No script yet</div>
        </div>
      </el-col>
      <el-col :md="16" :xl="rightXlSize" class="script-form-container">
        <div class="script-form">
          <el-form ref="form" :model="form" label-width="120px" label-position="top" :disabled="!isFormEnabled">
            <el-form-item label="Script name">
              <el-input v-model="form.name"></el-input>
            </el-form-item>
            <el-form-item label="Executable" label-width="200px">
              <el-select v-model="form.executableName" placeholder="please select an executable">
                <el-option v-for="script in detectedScripts" :key="script" :label="script" :value="script"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Start Command Line Arguments">
              <el-input type="textarea" v-model="form.startArguments"></el-input>
            </el-form-item>
            <el-form-item label="Stop Command Line Arguments">
              <el-input type="textarea" v-model="form.stopArguments"></el-input>
            </el-form-item>
            <el-form-item class="last-form-item">
              <el-button type="primary" @click="onSubmit">{{submitLabel}}</el-button>
              <el-button @click="onCancel" :disabled="!isCancelButtonEnabled">Cancel</el-button>
              <el-button class="right-button" type="danger" @click="onDelete()">
                <font-awesome-icon :icon="['fas', 'trash-alt']" fixed-width class="nav-icon" />
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import Axios from "axios";
  import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
  import { Button, Form, FormItem, Input, Select, Option, Tag } from "element-ui";
  import { mapGetters } from "vuex";

  export default {
    components: {
      "font-awesome-icon": FontAwesomeIcon,
      "el-button": Button,
      "el-form": Form,
      "el-form-item": FormItem,
      "el-input": Input,
      "el-select": Select,
      "el-option": Option,
      "el-tag": Tag
    },
    data() {
      return {
        scripts: [],
        detectedScripts: [],
        form: {
          name: undefined,
          executableName: undefined,
          startArguments: undefined,
          stopArguments: undefined
        },
        selectedScript: null
      };
    },
    computed: {
      ...mapGetters({
        rightBarIsCollapsed: "rightBarIsCollapsed"
      }),
      topXlSize: function() {
        return this.$store.state.rightbarIsCollapsed ? 18 : 24;
      },
      leftXlSize: function() {
        return this.$store.state.rightbarIsCollapsed ? 6 : 8;
      },
      rightXlSize: function() {
        return this.$store.state.rightbarIsCollapsed ? 12 : 16;
      },
      isFormEnabled: function() {
        return this.selectedScript !== null;
      },
      isAddButtonEnabled: function() {
        return (
          this.scripts.length === 0 ||
          this.scripts[this.scripts.length - 1].isNew === undefined
        );
      },
      isCancelButtonEnabled: function() {
        if (
          this.selectedScript === null ||
          (this.selectedScript.name === this.form.name &&
            this.selectedScript.executableName === this.form.executableName &&
            this.selectedScript.startArguments === this.form.startArguments &&
            this.selectedScript.stopArguments === this.form.stopArguments)
        ) {
          return false;
        }

        return true;
      },
      submitLabel: function() {
        return this.selectedScript !== null &&
          this.selectedScript.isNew !== undefined
          ? "Create"
          : "Update";
      }
    },
    methods: {
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
      selectScript: function(script) {
        this.selectedScript = script;

        if (script !== null) {
          this.form.name = script.name;
          this.form.executableName = script.executableName;
          this.form.startArguments = script.startArguments;
          this.form.stopArguments = script.stopArguments;
        } else {
          this.form = { name: undefined, executableName: undefined, startArguments: undefined, stopArguments: undefined };
        }
      },
      isActive: function(scriptName) {
        return (
          this.selectedScript !== null && scriptName === this.selectedScript.name
        );
      },
      refresh: function() {
        Axios.get("/api/scripts/")
          .then(response => {
            this.selectedScript = null;
            this.form = {
              name: undefined,
              executableName: undefined,
              startArguments: undefined,
              stopArguments: undefined
            };
            this.scripts = response.data.scripts;
          })
          .catch(error => {
            this.$store.dispatch("setMessage", {
              content: error.response.error + " : could not get scripts",
              type: "error"
            });
          });

        Axios.get("/api/scripts/detected")
          .then(response => {
            this.detectedScripts = response.data.scripts;
          })
          .catch(error => {
            this.$store.dispatch("setMessage", {
              content: error.response.error + " : could not get executables",
              type: "error"
            });
          });
      },
      addScript: function() {
        let newScript = {
          name: null,
          executableName: null,
          startArguments: null,
          stopArguments: null,
          isNew: true
        };

        this.scripts.push(newScript);
        this.selectScript(newScript);
      },
      onPost: function() {
        let self = this;

        Axios.post("/api/scripts/create", {
          name: this.form.name,
          executableName: this.form.executableName,
          startArguments: this.form.startArguments,
          stopArguments: this.form.stopArguments
        })
          .then(response => {
            self.$store.dispatch("setMessage", {
              content: this.form.name + " has been added successfully",
              type: "success"
            });

            for (let i = 0; i < this.scripts.length; i++) {
              const script = this.scripts[i];

              if (response.data._id === script._id) {
                self.scripts[i].name = response.data.script.name;
                self.scripts[i].executableName =
                  response.data.script.executableName;
                self.scripts[i].startArguments =
                  response.data.script.startArguments;
                self.scripts[i].stopArguments =
                  response.data.script.stopArguments;
                self.scripts[i].isNew = undefined;
                self.scripts[i]._id = response.data.script._id;

                if (self.selectedScript._id === script._id) {
                  self.selectedScript.name = response.data.script.name;
                  self.selectedScript.executableName =
                    response.data.script.executableName;
                  self.selectedScript.startArguments =
                    response.data.script.startArguments;
                  self.selectedScript.stopArguments =
                    response.data.script.stopArguments;
                  self.selectedScript.isNew = undefined;
                  self.selectedScript._id = response.data.script._id;
                }

                break;
              }
            }
          })
          .catch(error => {
            self.$store.dispatch("setMessage", {
              content: error.response.error + " : script could not be added",
              type: "error"
            });
          });
      },
      onPut: function() {
        let self = this;

        Axios.put("/api/scripts/update/" + this.selectedScript._id, {
          name: this.form.name,
          executableName: this.form.executableName,
          startArguments: this.form.startArguments,
          stopArguments: this.form.stopArguments
        })
          .then(response => {
            self.$store.dispatch("setMessage", {
              content: this.form.name + " has been updated",
              type: "success"
            });

            for (let i = 0; i < self.scripts.length; i++) {
              const script = self.scripts[i];

              if (response.data.script._id === script._id) {
                self.scripts[i] = response.data.script;

                if (self.selectedScript._id === script._id) {
                  self.selectedScript = response.data.script;
                }

                break;
              }
            }
          })
          .catch(error => {
            self.$store.dispatch("setMessage", {
              content:
                error.response.error + " : script could not be updated",
              type: "error"
            });
          });
      },
      onSubmit: function() {
        if (this.selectedScript.isNew !== undefined) {
          this.onPost();
        } else {
          this.onPut();
        }
      },
      onCancel: function() {
        this.form.name = this.selectedScript.name;
        this.form.executableName = this.selectedScript.executableName;
        this.form.startArguments = this.selectedScript.startArguments;
        this.form.stopArguments = this.selectedScript.stopArguments;
      },
      onDelete: function(script = this.selectedScript) {
        if (script.isNew !== undefined) {
          this.removeFromScripts(script);
        } else {
          let self = this;

          this.openConfirmMessage(
            "Are you sure you want to delete that script ? (only the database entry will be removed)",
            () => {
              Axios.delete("/api/scripts/delete/" + script._id)
                .then(response => {
                  self.removeFromScripts(script);
                })
                .catch(error => {
                  self.$store.dispatch("setMessage", {
                    content:
                  error.response.error + " : script could not be deleted",
                    type: "error"
                  });
                });
            }
          );
        }
      },
      removeFromScripts(scriptToDelete) {
        for (let i = 0; i < this.scripts.length; i++) {
          const script = this.scripts[i];

          if (scriptToDelete._id === script._id) {
            this.scripts.splice(i, 1);

            if (this.selectedScript.id === scriptToDelete.id) {
              if (i > 0) {
                this.selectScript(this.scripts[i - 1]);
              } else if (i < this.scripts.length) {
                this.selectScript(this.scripts[0]);
              } else {
                this.selectScript(null);
              }
            }

            return;
          }
        }
      }
    },
    mounted() {
      this.refresh();
    }
  };
</script>

<style lang="less" scoped>
  @import "../styles/styles.less";

  .el-col {
    transition: all 0.3s;
  }

  .last-form-item {
    margin-bottom: 0 !important;
  }

  .scripts-list {
    border: 1px solid #dcdfe6;
    box-shadow: 0 2px 4px 0 fadeout(@shadow-color, 88%),
      0 0 6px 0 fadeout(@shadow-color, 96%);
    background-color: white;

    .scripts-list-title {
      color: #35495e;
      background-color: #f5f7fa;
      height: 40px;
      line-height: 40px;
      font-weight: 600;
      text-align: right;
      padding-right: 10px;
    }

    ul {
      color: @default-dark-font-color;
      padding: 0;
      list-style-type: none;
      margin-top: 8px;
      margin-bottom: 8px;

      .script-item {
        cursor: pointer;
        padding-left: 28px;
        height: 40px;
        line-height: 40px;

        .new-disclaimer {
          float: right;
          // padding-right: 20px;
          // padding-top: 12px;
          margin-right: 12px;
          margin-top: 4px;
          background-color: #f5f7fa !important;
        }

        &:hover {
          background-color: white;
        }

        &.active {
          background-color: white;
          font-weight: bold;
        }
      }
    }

    div {
      color: @default-dark-font-color;
      text-align: center;
      height: 40px;
      line-height: 40px;
    }
  }

  .script-form-container {
    @media (max-width: 767px) {
      margin-top: 20px;
    }

    .script-form {
      border: 1px solid #dcdfe6;
      box-shadow: 0 2px 4px 0 fadeout(@shadow-color, 88%),
        0 0 6px 0 fadeout(@shadow-color, 96%);
      padding: 20px;
    }
  }

  .right-button {
    float: right;
  }
</style>
