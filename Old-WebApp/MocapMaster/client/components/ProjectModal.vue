<template>
  <el-dialog title="Project" :visible.sync="dialogFormVisible" width="500px">
    <el-row :gutter="20">
      <el-col :span="12" class="spaceInfos">
        <el-select v-model="selectedProject" placeholder="Select" class="project-selector">
          <el-option v-for="p, index in projects" :key="index" :label="p.label" :value="p">
            <span v-if="p.value.name !== null">
              <span style="float: left">{{ p.value.name }}</span>
              <span v-if="p.new === true" style=" font-size: 13px"> [new]</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ p.value.currentIndex }}</span>
            </span>
            <span v-else>
              <span style="float: left">
                <strong>{{ p.label }}</strong>
              </span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                <font-awesome-icon :icon="['fas', 'plus']" fixed-width/>
              </span>
            </span>
          </el-option>
        </el-select>
      </el-col>
      <el-col v-if="selectedProject !== null && selectedProject.new === false" :span="8">
        <el-input-number v-model="selectedProject.value.currentIndex" :min="0" :max="99999" controls-position="right" class="project-index"></el-input-number>
      </el-col>
      <el-col v-if="selectedProject !== null && selectedProject.new === false" :span="4">
        <el-button type="default" @click="onDelete()">
          <font-awesome-icon :icon="['fas', 'trash-alt']" fixed-width/>
        </el-button>
      </el-col>
    </el-row>
    <div class="form-container" v-if="selectedProject !== null && selectedProject.new === true">
      <el-form ref="form" :model="selectedProject.value" label-position="top" label-width="120px" class="new-project-form">
        <el-form-item label="Name">
          <el-input v-model="selectedProject.value.name"></el-input>
        </el-form-item>
        <el-form-item label="Index">
          <el-input-number v-model="selectedProject.value.currentIndex" :min="0" :max="99999" controls-position="right" class="project-index"></el-input-number>
        </el-form-item>
      </el-form>
    </div>
    <div class="actions">
      <el-button @click="onToggle()">Cancel</el-button>
      <el-button type="primary" @click="onConfirm()">Confirm</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import FontAwesomeIcon from "@fortawesome/vue-fontawesome";
  import { Dialog, Form, FormItem, Select, Option, Button, Input, InputNumber, Collapse, CollapseItem } from "element-ui";
  import { mapGetters } from "vuex";
  import { bus } from "../app";
  import Axios from "axios";

  export default {
    components: {
      "font-awesome-icon": FontAwesomeIcon,
      "el-dialog": Dialog,
      "el-form": Form,
      "el-form-item": FormItem,
      "el-select": Select,
      "el-option": Option,
      "el-button": Button,
      "el-input": Input,
      "el-input-number": InputNumber,
      "el-collapse": Collapse,
      "el-collapse-item": CollapseItem
    },
    data() {
      return {
        projects: [],
        dialogFormVisible: false,
        selectedProject: null
      };
    },
    computed: {
      ...mapGetters({ project: "project" })
    },
    methods: {
      get: function() {
        let self = this;

        Axios.get("api/project/getAll").then(function(response) {
          self.projects = [];

          response.data.projects.forEach(p => {
            self.projects.push({ label: p.name, new: false, value: p });

            if (p.current === true) {
              self.selectedProject = self.projects[self.projects.length - 1];
            }
          });
          self.projects.push({ label: "New project", new: true, value: { name: null, currentIndex: 0 } });
        });
      },
      post: function(project) {
        Axios.post("api/project/", { name: project.value.name, startIndex: project.value.currentIndex }).then(response => {
          this.$store.dispatch("setProject", response.data.project);
          this.onToggle();
        });
      },
      put: function(project) {
        Axios.put("api/project/" + project.value._id, { currentIndex: project.value.currentIndex }).then(response => {
          this.$store.dispatch("setProject", project.value);
          this.onToggle();
        });
      },
      delete: function(project) {
        Axios.delete("api/project/" + project.value._id).then(response => {
          if (project.value.current === true) {
            this.$store.dispatch("setProject", null);
          }

          this.selectedProject = null;
          this.get();
        });
      },
      onToggle: function() {
        this.dialogFormVisible = false;
      },
      onConfirm: function() {
        if (this.selectedProject !== null) {
          if (this.selectedProject.new === true) {
            this.post(this.selectedProject);
          } else {
            this.put(this.selectedProject);
          }
        } else {
          this.onToggle();
        }
      },
      onDelete: function() {
        this.delete(this.selectedProject);
      }
    },
    watch: {
    },
    filters: {
      capitalize: function(value) {
        if (!value) return "";
        value = value.toString();
        return value.charAt(0).toUpperCase() + value.slice(1);
      }
    },
    mounted() {
      bus.$on("project-modal-toggle", () => {
        this.dialogFormVisible = true;
        this.get();
      });
    }
  };
</script>

<style lang="less" scoped>
  @import "../styles/styles.less";

  .project-selector {
    width: 100%;
  }

  .project-index {
    width: 100%;
  }

  .actions {
    margin-top: 20px;
    padding-top: 20px;
    border-top: @primary-color-4 2px solid;
  }

  .new-project-form {
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .form-container {
    padding: 0px 20px;
  }
</style>
