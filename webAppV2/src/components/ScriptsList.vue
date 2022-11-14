<template>
  <el-card shadow="hover" class="list-card">
    <table ref="multipleTableRef" class="script-table">
      <thead class="script-table-head">
        <tr>
          <th>
            <span v-if="show">
              <el-checkbox v-model="allSelected" @change="selectAll">
              </el-checkbox>
            </span>
            Scripts<el-button @click="this.show = !this.show, sendResize()" class="deploy-component-btn">
              <span v-if="!show">
                <el-icon>
                  <Plus />
                </el-icon>
              </span>
              <span v-else>
                <el-icon>
                  <Minus />
                </el-icon>
              </span>
            </el-button>
          </th>
        </tr>
      </thead>
      <div v-if="show" class="script-table-body">
        <tbody>
          <el-checkbox-group v-model="selectedScripts">
            <el-checkbox v-for="script in activeScripts" :key="script" :value="script" :label="script"
              class="CheckboxScripts" @change="selectChange(script)">
              {{ script.name }}
              <el-button size="small" text @click="selectScript(script.name, activeScripts)"
                v-on:click="openEditScript">
                <el-icon>
                  <Edit />
                </el-icon>
              </el-button>
            </el-checkbox>
          </el-checkbox-group>
        </tbody>
      </div>
    </table>
  </el-card>
</template>

<script>
//import test from 'node:test';
import { reactive, ref } from "vue";

const dialogFormVisible = ref(false);
const formLabelWidth = "140px";

let form = reactive({
  name: "",
  executableName: "",
  startArgs: "",
  stopArgs: "",
});

export default {
  name: "ScriptsList",
  data() {
    return {
      form,
      formLabelWidth,
      dialogFormVisible,
      activeScripts: [],
      loadedExecs: [],
      selectedScripts: [],
      allSelected: false,
      show: true,
      checkAll: false,
    };
  },
  async mounted() {
    let self = this;

    // Fetching data from the server and assigning it to the activeScripts and loadedExecs variables.
    const scriptData = fetch("http://localhost:3000/scripts");
    scriptData
      .then((response) => response.json())
      .then((data) => {
        this.activeScripts = data;
        this.phoneIpGrabber(this.activeScripts);
      })
    const execData = await fetch("http://localhost:3000/execs");
    const newExecData = await execData.json();
    this.loadedExecs = newExecData;
    //this.checkScriptExecutables()
  },
  methods: {
    sendResize() {
      this.emitter.emit("resizeCard", "ScriptsList");
    },
    // Parsing the IP of the database concerning the Iphones IP addresses in order to send only
    // what we need to the Iphones.vue file.
    phoneIpGrabber(scripts) {
      const script = scripts.find(script => script.name === "LiveLinkFace");
      let IphonesIP = script.startTokens[1];
      IphonesIP = IphonesIP.split("=")
      IphonesIP.splice(0, 1)
      IphonesIP = IphonesIP[0].split("/")
      this.emitter.emit("IphonesIP", IphonesIP)
    },
    
    checkScriptExecutables() {
      console.log("ehoo")
      let check = 0;
      for (let script of this.activeScripts) {
        check = 0;
        for (let exec of this.loadedExecs) {
          if (this.activeScripts[script].executableName === this.loadedExecs[exec].name) {
            check = 1;
          }
        }
        if (check = 0) {
          let newNotif = {
            name: this.activeScripts[script].executableName + "has no valid executable in launchScripts folder",
            type: "error",
            index: 0
          }
          this.emitter.emit("errorNotification", newNotif)
        }
      }
    },
    // Emitting an event called scriptSelectionChange and passing the selectedScripts variable as a
    // parameter.
    selectChange(script) {
      this.emitter.emit("scriptSelectionChange", this.selectedScripts);
    },

    // This is a method that is called when the user clicks on the edit button. It emits an event called
    // openEditScript and passes the selectedScript as a parameter.
    openEditScript() {
      this.emitter.emit("openEditScript", this.selectedScript);
    },

    // This method is called when the user clicks on the checkbox in the header of the table. It checks if
    // the checkbox is checked or not and if it is checked it assigns the id of each script to the
    // selectedScripts variable. If the checkbox is not checked it assigns an empty array to the
    // selectedScripts variable.
    selectAll() {
      if (this.allSelected === true) {
        for (let i = 0; i < this.activeScripts.length; i++) {
          this.selectedScripts.push(this.activeScripts[i]);
        }
      } else {
        this.selectedScripts = [];
      }
      this.emitter.emit("scriptSelectionChange", this.selectedScripts);
    },

    // A method that is called when the user clicks on the save button. It fetches the data from the server
    // and assigns it to the activeScripts variable.
    reloadScripts() {
      const data = fetch("http://localhost:3000/scripts");
      const newData = JSON.stringify(data);
      this.activeScripts = newData;
      const Iphones = this.activeScripts.find(project => project.name === "LiveLinkFace");
      this.phoneIpGrabber();
      this.checkScriptExecutables()
    },

    // A method that is called when the user clicks on the edit button. It emits an event called
    // // openEditScript and passes the selectedScript as a parameter.
    selectScript(name, activeScripts) {
      for (let script in activeScripts) {
        if (activeScripts[script].name == name) {
          this.selectedScript = activeScripts[script];
          this.form.name = activeScripts[script].name;
          this.form.executableName = activeScripts[script].executableName;
          this.form.startArgs = activeScripts[script].startArgs;
          this.form.stopArgs = activeScripts[script].stopArgs;
        }
      }
      if (this.form.name === null) {
        form = {
          name: undefined,
          executableName: undefined,
          startArgs: undefined,
          stopArgs: undefined,
        };
      }
    },
  },
};
</script>
