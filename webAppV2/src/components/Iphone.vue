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
              Iphones<el-button @click="this.show = !this.show" class="deploy-component-btn">
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
            <el-checkbox-group v-model="selectedIphones">
              <el-checkbox v-for="IP in this.IphonesIP" :key="IP" :value="IP" :label="IP"
                class="CheckboxScripts" @change="selectChange(IP)">
                {{ IP }}
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
    name: "Iphones",
    data() {
      return {
        IphonesIP: [],
        form,
        formLabelWidth,
        dialogFormVisible,
        activeIphones: [],
        selectedIphones: null,
        selectedIphones: [],
        allSelected: false,
        show: true,
        isIndeterminate: true,
        checkAll: false,
      };
    },
    async mounted() {
      let self = this;
  
      // Fetching data from the server and assigning it to the activeScripts and loadedExecs variables.
      const Iphonedata = await fetch("http://localhost:3000/scripts");
      const execData = await fetch("http://localhost:3000/execs");
      const newIphonedata = await Iphonedata.json();
      const newExecData = await execData.json();
      this.activeIphones = newIphonedata;
      this.loadedExecs = newExecData;
    },

    created() {
        this.emitter.on("IphonesIP", (evt) => {
            this.IphonesIP = evt;
        });
    },
    methods: {
      checkScriptExecutables() {
      let check = 0;
      for (let script of this.activeIphones) {
        check = 0;
      }
    },
    selectChange(script) {
      this.emitter.emit("IphoneSelectionChange", this.selectedIphones);
    },
    selectAll() {
      if (this.allSelected === true) {
        for (let i = 0; i < this.activeIphones.length; i++) {
          this.selectedIphones.push(this.activeIphones[i]);
        }
      } else {
        this.selectedIphones = [];
      }
      this.emitter.emit("IphoneSelectionChange", this.selectedIphones);
    },
  }
}
  </script>
  