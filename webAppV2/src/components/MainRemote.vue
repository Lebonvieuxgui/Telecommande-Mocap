<template>
  <el-card shadow="hover" class="MainRemoteCard">
    <div class="card-header">Record</div>
    <el-form :model="form" label-width="200px">
      <div class="file-info">
        <el-form-item label="File Name" style="margin-top: 30px">
          <div v-if="this.activeProject.id !== 0">{{ getFilename() }}</div>
          <div v-else>null_FILENAME</div>
        </el-form-item>
        <el-form-item label="Duration">00:00:0</el-form-item>
      </div>
      <div class="sequence-group">
        <div class="group1">
          <el-form-item label="Sequence" style="margin-top: 15px">
            <el-input v-model="form.name" @change="getFilename" />
          </el-form-item>
          <el-form-item label="Take" style="margin-top: 1vw;">
            <el-input-number v-model="num" :min="1" :max="99999" @change="handleChange" class="take"/>
          </el-form-item>
        </div>
        <el-form-item class="record-button">
          <el-button v-bind:class="record ? 'recording' : 'not-recording'" @click="(record = !record), onSubmit()">
            <div v-if="record">
              <el-icon>
                <VideoPause />
              </el-icon>
            </div>
            <div v-else>
              <el-icon>
                <VideoPlay />
              </el-icon>
            </div>
          </el-button>
        </el-form-item>
      </div>
    </el-form>
  </el-card>
</template>

<script lang="ts">
import { reactive } from "vue";
import { ref } from "vue";

const num = ref(1);
const handleChange = (value: number) => {
  console.log(value);
};

// A function that formats the currentIndex to be a string with leading zeros.
function indexFormatter(currentIndex) {
  if (currentIndex < 10) {
    currentIndex = "000" + currentIndex;
  } else if (currentIndex < 100) {
    currentIndex = "00" + currentIndex;
  } else if (currentIndex < 1000) {
    currentIndex = "0" + currentIndex;
  }
  return currentIndex;
}

const form = reactive({
  name: "",
});

export default {
  data() {
    return {
      form,
      handleChange,
      num,
      record: false,
      takeIndex: 0,
      sequenceName: "",
      filename: "",
      activeProject: {
        id: 0,
        name: "",
        currentIndex: 0,
        current: false,
      },
      selectedProjects: []
    };
  },

  // Calling the refreshProject() method when the component is mounted.
  mounted() {
    this.refreshProject();
  },

  // Listening for an event called 'updateActiveProject' and when it receives it, it sets the
  // selectedProject to the event.
  created() {
    this.emitter.on("updateActiveProject", (evt) => {
      this.activeProject = evt;
    });
    this.emitter.on("refreshProject", () => {
      this.refreshProject();
    });
    this.emitter.on("scriptSelectionChange", (evt) => {
      this.selectedProjects = evt;
      console.log(this.selectedProjects)
    })
  },
  methods: {
    onSubmit() {
      if (this.record === false) {
        this.num++;
      }
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          Connection: "keep-alive",
        },
      };
      fetch("http://localhost:3000/scripts", requestOptions);
      console.log(this.$globalSelectedScripts)
    },
    // A method that is called when the user types in the sequence name. It takes the current project name,
    // the current index, the sequence name, and the take number and concatenates them together to form a
    // filename.
    getFilename() {
      let currentIndex = indexFormatter(this.activeProject.currentIndex);

      this.$globalFilename =
        this.activeProject.name +
        "_" +
        currentIndex +
        "_" +
        this.form.name +
        this.num;
      this.filename = this.$globalFilename;
      return this.filename;
    },

    // A method that is called when the component is mounted. It fetches the projects from the database and
    // sets the selectedProject to the current project.
    async refreshProject() {
      const data = await fetch("http://localhost:3000/projects");
      const newData = await data.json();
      this.activeProjects = newData;
      for (let i = 0; i < this.activeProjects.length; i++) {
        if (this.activeProjects[i].current === true) {
          this.activeProject = this.activeProjects[i];
          this.$globalActiveProject = this.activeProject;
        }
      }
      return this.activeProject;
    },
  },
};
</script>
