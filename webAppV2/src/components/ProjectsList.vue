<template>
  <el-card shadow="hover" class="list-card">
    <table ref="multipleTableRef" class="project-table">
      <thead class="project-table-head">
        <tr>
          <th>
            Projects<el-button @click="this.show = !this.show" class="deploy-component-btn">
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
      <div v-if="show">
        <tbody class="project-table-body">
          <el-select v-model="selected" effect="dark" class="project-select" placeholder="Select project" size="large"
            @click="refreshProjects()">
            <el-option v-for="project in activeProjects" :key="project.id" :label="project.name" :value="project.id"
              @click="activate(project);">
              <span>{{ project.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ project.currentIndex }}
              </span>
            </el-option>
          </el-select>
          <el-input-number class='take' v-model="num" :min="0" :max="99999" size="large" @change="handleChangeNum"></el-input-number>
          <span>
            <el-button class="add-projects">
              <el-icon @click="openNewProjectForm" style="color: black;">
                <Plus />
              </el-icon>
            </el-button>
            <el-popconfirm title="Are you sure want to premanently delete this project?" @confirm="deleteProject()">
              <template #reference>
                <el-button class="delete-projects" @click="confirmProjectDelete">
                  <el-icon style="color: black;">
                    <Delete />
                  </el-icon>
                </el-button>
              </template>

            </el-popconfirm>
          </span>
        </tbody>
      </div>
    </table>
  </el-card>
</template>

<script lang="ts">
import { reactive, ref } from 'vue'

const num = ref(1)
const handleChangeNum = (value: number) => {
  console.log(value)
}
const selected = {}
const dialogFormVisible = ref(false);
const formLabelWidth = '140px';
const newProjectDialogVisible = ref(false);

let form = reactive({
  name: '',
  executableName: '',
  startArgs: '',
  stopArgs: '',
  show: true
});

let newProjectForm = reactive({
  name: '',
  executableName: '',
  startArgs: '',
  stopArgs: '',
});

export default {
  name: 'projectsList',
  data() {
    return {
      form,
      formLabelWidth,
      dialogFormVisible,
      activeProject: null,
      activeProjects: [],
      loadedExecs: [],
      selectedProject: null,
      selectedProjectTake: [],
      selected,
      num,
      handleChangeNum,
      show: true,
    }
  },
  created() {

    // Listening for an event called refreshProjects. When it receives this event, it will run the code
    // inside the function.
    this.emitter.on("refreshProjects", (evt) => {
      if (evt.current === true) {
        this.activate(evt);
      }
      this.refreshProjects();
      let tmp = this.selected;
      let tmp2;
      while (tmp === this.selected) {
        tmp2 = this.activeProjects.find(element => element.current === true)
        console.log(tmp2)
        this.selected = tmp2.id
      }
    })
  },

  // Fetching data from the server and setting the data to the activeProjects array.
  async mounted() {
    let self = this;

    const data = await fetch("http://localhost:3000/projects");
    const newData = await data.json();
    this.activeProjects = newData;
    for (let i = 0; i < this.activeProjects.length; i++) {
      if (this.activeProjects[i].current === true) {
        this.activeProject = this.activeProjects[i];
        this.selected = this.activeProject.id;
        this.num = this.activeProject.currentIndex;
        return;
      }
    }
  },

  methods: {
    // This is a method that is called when the user selects a new project. It emits an event called
    // updateActiveProject. This event is listened for in the main.ts file.
    updateActiveProject() {
      this.emitter.emit('updateActiveProject', this.selectedProject)
    },


    // This method is called when the user clicks the delete button. It emits an event called
    // confirmProjectDelete. This event is listened for in the main.ts file.
    confirmProjectDelete() {
      this.emitter.emit("confirmProjectDelete", this.selectedProject);
    },

    // This is a method that is called when the user clicks the plus button. It emits an event called
    // openNewProjectForm. This event is listened for in the main.ts file.
    openNewProjectForm() {
      this.emitter.emit("openNewProjectForm");
    },

    // A method that is called when the user selects a new project. It emits an event called
    // // updateActiveProject. This event is listened for in the main.ts file.
    activate(selectedProject) {
      this.selectedProject = selectedProject;
      this.num = this.selectedProject.currentIndex;
      let newActive = this.postCurrent();
      let newInactive = this.deactivateOldCurrent();
      let data = [newActive, newInactive];
      let requestOptions = {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*",
          "Connection": "keep-alive"
        },
        body: JSON.stringify(data)
      };
      fetch('http://localhost:3000/projects/', requestOptions);
      this.emitter.emit('updateActiveProject', this.selectedProject);
    },

    // This method is called when the user selects a new project. It sets the current project to true and
    // returns the new active project.
    postCurrent() {
      let newActiveData;
      let check = 0;
      for (let i = 0; i < this.activeProjects.length; i++) {
        if (this.activeProjects[i].current === true && this.activeProjects[i].name === this.selectedProject.name) {
          return;
        }
        if (this.activeProjects[i].current === true && this.activeProjects[i].name !== this.selectedProject.name) {
          newActiveData = this.selectedProject;
          check = 1;
        }
      }
      if (check === 0) {
        return;
      }
      if (newActiveData.id == 0) {
        newActiveData.id = this.activeProjects.length + 1;
      }
      newActiveData.current = true;
      return newActiveData;
    },

    // This method is called when the user selects a new project. It sets the current project to false and
    // returns the new inactive project.
    deactivateOldCurrent() {
      let newInactiveData;
      let check = 0;
      for (let i = 0; i < this.activeProjects.length; i++) {
        if (this.activeProjects[i].current === true && this.activeProjects[i].name !== this.selectedProject.name) {
          newInactiveData = this.activeProjects[i];
          check = 1;
        }
      }
      if (check === 0) {
        return;
      }
      newInactiveData.current = false;
      return newInactiveData;
    },

    async deleteProject() {
      let id = this.activeProject.id;
      let requestOptions = {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*",
          "Connection": "keep-alive"
        },
        body: JSON.stringify(this.activeProject)
      };
      await fetch('http://localhost:3000/projects/' + id, requestOptions);
      await this.refreshProjects();
      await this.emitter.emit('updateActiveProject', this.activeProject);
    },
    // This is a method that is called when the user selects a new project. It fetches the data from the
    // server and sets the data to the activeProjects array.
    async refreshProjects() {
      const data = await fetch("http://localhost:3000/projects");
      const newData = await data.json();
      this.activeProjects = newData;
      for (let i = 0; i < this.activeProjects.length; i++) {
        if (this.activeProjects[i].current === true) {
          this.activeProject = this.activeProjects[i];
          this.selected = this.activeProject.id;
          this.num = this.activeProject.currentIndex;
          return;
        }
      }
    }
  },
}
</script>
