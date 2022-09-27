<template>
  <el-card shadow="hover" class="list-card">
    <table ref="multipleTableRef">
      <thead class="script-table-head">
        <tr>
          <th>
            <el-checkbox v-model="allSelected" @change="selectAll">
            </el-checkbox>
            Iphones<el-button @click="this.show = !this.show, sendResize()" class="deploy-component-btn">
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
            <el-checkbox v-for="IP in this.iphonesIP" :key="IP" :value="IP" :label="IP" class="CheckboxScripts"
              @change="selectChange(IP)" :checked=true>
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
      iphonesIP: [],
      form,
      formLabelWidth,
      dialogFormVisible,
      selectedIphones: [],
      allSelected: true,
      show: false,
      checkAll: false,
    };
  },

  created() {
    this.emitter.on("IphonesIP", (evt) => {
      this.iphonesIP = evt;
    });
    this.emitter.emit("iphoneSelectionChange", this.selectedIphones);
  },
  methods: {
    sendResize() {
      this.emitter.emit("resizeCard", "Iphones");
    },
    selectChange(script) {
      this.emitter.emit("iphoneSelectionChange", this.selectedIphones);
    },
    selectAll() {
      if (this.allSelected === true) {
        for (let i = 0; i < this.iphonesIP.length; i++) {
          this.selectedIphones.push(this.iphonesIP[i]);
        }
      } else {
        this.selectedIphones = [];
      }
      this.emitter.emit("iphoneSelectionChange", this.selectedIphones);
    },
  }
}
</script>
  