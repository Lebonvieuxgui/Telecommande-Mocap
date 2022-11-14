<template>
  <el-card shadow="hover" class="MainRemoteCard">
    <div class="card-header">Record</div>
    <el-form class="main-remote-form" :model="form" label-width="200px">
      <div class="file-info">
        <el-form-item label="File Name" style="margin-top: 30px">
          <div v-if="this.activeProject.id !== 0">{{ getFilename() }}</div>
          <div v-else>null_FILENAME</div>
        </el-form-item>
        <el-form-item label="Duration">00:00:0</el-form-item>
      </div>
      <div class="sequence-group">
        <div class="group1">
          <el-form-item class="takename-item" label="Sequence" style="margin-top: 15px">
            <el-input class="takeName" v-bind:placeholder="this.form.name === '' ? 'Please enter take name' : ''" v-bind:disabled="record ? true : false" v-model="form.name" @change="getFilename" />
          </el-form-item>
          <el-form-item label="Take" style="margin-top: 1vw;">
            <el-input-number v-model="num" :min="1" :max="99999" @change="handleChange" class="take" />
          </el-form-item>
        </div>
        <el-form-item class="record-button">
          <el-popover :visible="this.selectedScripts[0] === undefined && this.form.name != '' ? true : false" placement="top-start" content="Please select scripts" :width="155">
            <template #reference>
            <el-button v-bind:disabled="this.form.name === '' || this.selectedScripts[0] === undefined? true : false" v-bind:class="record ? 'recording' : 'not-recording'" @click="(record = !record), onSubmit()">
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
        </template>
        </el-popover>
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
  console.log('a')
  if (currentIndex < 10) {
    currentIndex = "00" + currentIndex;
  } else if (currentIndex < 100) {
    currentIndex = "0" + currentIndex;
  } else if (currentIndex < 1000) {
    currentIndex = currentIndex;
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
      selectedScripts: [],
      activeIps: [],
      visiblePop: false
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
      this.selectedScripts = evt;
      console.log(this.selectedScripts)
    });
    this.emitter.on("iphoneSelectionChange", (evt) => {
      this.activeIps = evt;
    })
  },
  methods: {
    // A function that takes an array of objects and replaces the value of a property in each object with a
    // new value.
    filenameHandler(sentScripts) {
      let filename = this.getFilename();
      for (let script in sentScripts) {
        sentScripts[script].variables[0].name = filename;
        console.log(this.record)
        if (this.record === false) {
          sentScripts[script].variables[0].value = true;
        } else {
          sentScripts[script].variables[0].value = false;
        }
        for (let token in sentScripts[script].startTokens) {
          sentScripts[script].startTokens[token] = sentScripts[script].startTokens[token].replaceAll('$filename', filename);
        }
        for (let token in sentScripts[script].stopTokens) {
          sentScripts[script].stopTokens[token] = sentScripts[script].stopTokens[token].replaceAll('$filename', filename);
        }
        // Adding the active IP addresses to the startTokens and stopTokens arrays if the script is named LiveLinkFace.
        if (sentScripts[script].name === 'LiveLinkFace') {
          sentScripts[script].startTokens[1] = '--ip=';
          sentScripts[script].stopTokens[1] = '--ip=';
          console.log(this.activeIps)
          for (let ip in this.activeIps) {
            sentScripts[script].startTokens[1] += this.activeIps[ip];
            sentScripts[script].stopTokens[1] += this.activeIps[ip];
            if (this.activeIps[ip] != this.activeIps[this.activeIps.length - 1]) {
              sentScripts[script].startTokens[1] += '/';
              sentScripts[script].stopTokens[1] += '/';
            }
          }
        }
        sentScripts[script].startArgs = sentScripts[script].startArgs.replaceAll('$filename', filename);
      }
      return sentScripts
    },

    // Sending a POST request to the server with the selectedScripts array to run selected scripts serverside
    onSubmit() {
      if (this.record === false) {
        this.num++;
        this.activeProject.currentIndex++;
        this.emitter.emit('incrementTotalTakes');
      }
      var sentScripts = JSON.parse(JSON.stringify(this.selectedScripts));
      sentScripts = this.filenameHandler(sentScripts);
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          Connection: "keep-alive",
        },
        body: JSON.stringify(sentScripts)
      };
      sentScripts = []
      let res = fetch("http://localhost:3000/scripts", requestOptions);
      res
        .then((response) => response.json())
        .then(data => {
          let runStatus;
          if (data[1] != null && this.record == false) {
            this.record ? runStatus = {name: "Some scripts didn't start properly", type:"error", index: 0} : runStatus = {name: "Some scripts didn't stop properly", type:"error", index: 0}
          } else {
            this.record ? runStatus = {name: "Every script started properly", type:"success", index: 0} : runStatus = {name: "Every script stopped properly", type:"success", index: 0}
          }
          this.emitter.emit("errorNotification", runStatus);
        })
    },
    // A method that is called when the user types in the sequence name. It takes the current project name,
    // the current index, the sequence name, and the take number and concatenates them together to form a
    // filename.
    getFilename() {
      let currentIndex = indexFormatter(this.activeProject.currentIndex);
      let num = indexFormatter(this.num);
      console.log(currentIndex);
      this.$globalFilename =
        this.activeProject.name +
        "_" +
        currentIndex +
        "_" +
        this.form.name +
        num;
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
