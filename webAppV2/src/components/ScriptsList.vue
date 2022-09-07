<template>
  <el-card shadow="hover" class="list-card">
    <table ref="multipleTableRef">
      <thead class="script-table-head">
        <tr>
          <th>
            <el-checkbox v-model="allSelected" @change="selectAll">
            </el-checkbox>
            Scripts<el-button @click="this.show = !this.show" class="add-project-btn">
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
            <el-checkbox v-for="script in activeScripts" :key="script.name" :label="script.name"
              class="CheckboxScripts">
              {{ script.name
              }}<el-button size="small" text @click="selectScript(script.name, activeScripts)"
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
    };
  },
  async mounted() {
    let self = this;

    const data = await fetch("http://localhost:3000/scripts");
    const newData = await data.json();
    this.activeScripts = newData;
    const execData = await fetch("http://localhost:3000/execs");
    const newExecData = await execData.json();
    this.loadedExecs = newExecData;
  },
  methods: {
    openEditScript() {
      this.emitter.emit("openEditScript", this.selectedScript);
    },
    async selectAll() {
      if (this.allSelected) {
        const selectedScripts = this.activeScripts.map((script) => script.id);
        this.selectedScripts = selectedScripts;
      } else {
        this.selectedScripts = [];
      }
    },
    reloadScripts() {
      const data = fetch("http://localhost:3000/scripts");
      const newData = JSON.stringify(data);
      this.activeScripts = newData;
    },
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
