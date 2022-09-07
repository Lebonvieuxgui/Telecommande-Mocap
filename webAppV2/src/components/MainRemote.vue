<template>
  <el-card shadow="hover" class="MainRemoteCard">
    <div class="record-button">
        <el-form-item>
          <a href="#">
            <el-button v-bind:class="record ? 'liquid1::after' : 'liquid1::before'"
              @click="(record = !record), onSubmit">
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
            <div v-bind:class="record ? 'liquid1' : 'liquid2'"></div>
          </a>
        </el-form-item>
      </div>
    <div class="card-header">Record</div>
    <el-form :model="form" label-width="200px">
      <div class="file-info">
        <el-form-item label="File Name" style="margin-top: 30px">
          <div v-if="this.selectedProject.id !== 0">{{ getFilename() }}</div>
          <div v-else>null_FILENAME</div>
        </el-form-item>
        <el-form-item label="Duration">00:00:0</el-form-item>
      </div>
      <div class="sequence-group">
        <el-form-item label="Sequence" style="margin-top: 15px">
          <el-input v-model="form.name" @change="getFilename" />
        </el-form-item>
        <el-form-item label="Take" style="margin-top: 15px; margin-right: 10px">
          <el-input-number v-model="num" :min="1" :max="10" @change="handleChange" />
        </el-form-item>
      </div>
    </el-form>
  </el-card>
</template>

<script lang="ts">
import { reactive } from 'vue'
import { ref } from 'vue'

const num = ref(1)
const handleChange = (value: number) => {
  console.log(value)
}

function indexFormatter(currentIndex) {
  if (currentIndex < 10) {
    currentIndex = "000" + currentIndex
  }
  else if (currentIndex < 100) {
    currentIndex = "00" + currentIndex
  }
  else if (currentIndex < 1000) {
    currentIndex = "0" + currentIndex
  }
  return currentIndex;
}

// do not use same name with ref
const form = reactive({
  name: '',
  region: '',
  date1: '',
  date2: '',
  delivery: false,
  type: [],
  resource: '',
  desc: '',
})

const onSubmit = () => {
  console.log('submit!')
}

export default {
  data() {
    return {
      form,
      onSubmit,
      handleChange,
      num,
      record: false,
      takeIndex: 0,
      sequenceName: '',
      filename: '',
      selectedProject: {
        "id": 0,
        "name": "",
        "currentIndex": 0,
        "current": false
      }
    }
  },
  mounted() {
    this.refreshProject()
  },
  created() {
    this.emitter.on('updateActiveProject', (evt) => {
      this.selectedProject = evt
    })
  },
  methods: {
    getFilename() {
      let currentIndex = indexFormatter(this.selectedProject.currentIndex)

      this.$globalFilename = this.selectedProject.name + '_' + currentIndex + '_' + this.form.name + this.num
      this.filename = this.$globalFilename
      return this.filename
    },
    async refreshProject() {
      const data = await fetch("http://localhost:3000/projects");
      const newData = await data.json();
      this.activeProjects = newData;
      for (let i = 0; i < this.activeProjects.length; i++) {
        if (this.activeProjects[i].current === true) {
          this.selectedProject = this.activeProjects[i];
          this.$globalActiveProject = this.selectedProject;
        }
      }
      console.log(this.selectedProject)
      return this.selectedProject;
    }
  }

}
</script>
