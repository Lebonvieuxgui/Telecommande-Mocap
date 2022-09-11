<template>
  <el-card shadow="hover" class="list-card">
    <table ref="multipleTableRef">
      <thead class="script-table-head">
        <tr>
          <th>
            <span v-if="show">
              <el-checkbox v-model="allSelected" @change="selectAll">
              </el-checkbox>
            </span>
            Scripts<el-button @click="this.show = !this.show" class="deploy-component-btn">
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
            <el-checkbox v-for="script in activeScripts" :key="script.name" :label="script.name" class="CheckboxScripts" @change="selectChange(script)">
              {{ script.name}}
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
      selectedScript: null,
      selectedScripts: [],
      allSelected: false,
      show: true,
      isIndeterminate: true,
      checkAll: false,
    };
  },
  async mounted() {
    let self = this;

    // Fetching data from the server and assigning it to the activeScripts and loadedExecs variables.
    const scriptData = fetch("http://localhost:3000/scripts");
    const execData = fetch("http://localhost:3000/execs");
    const res = await Promise.all([scriptData, execData])
    const newScriptData = await res[0].json();
    const newExecData = await res[1].json();
    this.activeScripts = newScriptData;
    this.loadedExecs = newExecData;
  },
  methods: {
    selectChange(script) {
      console.log(this.selectedScripts);
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
      console.log(this.selectedScripts);
    },
    // A method that is called when the user clicks on the save button. It fetches the data from the server
    // and assigns it to the activeScripts variable.
    reloadScripts() {
      const data = fetch("http://localhost:3000/scripts");
      const newData = JSON.stringify(data);
      this.activeScripts = newData;
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
    // A method that is called when the user clicks on the save button. It sends changes made to selected script to the server
    postChanges() {
      let newData = this.selectedScript;
      if (this.form.name !== newData.name) {
        newData.name = this.form.name;
      }
      if (this.form.executableName !== newData.executableName) {
        newData.executableName = this.form.executableName;
      }
      if (this.form.startArgs !== newData.startArgs) {
        newData.startArgs = this.form.startArgs;
      }
      if (this.form.stopArgs !== newData.stopArgs) {
        newData.stopArgs = this.form.stopArgs;
      }
      let id = newData.id;
      const requestOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          Connection: "keep-alive",
        },
        body: JSON.stringify(newData),
      };
      fetch("http://localhost:3000/scripts/" + id, requestOptions);
    },
  },
};
</script>
