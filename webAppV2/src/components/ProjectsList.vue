<template>
    <el-card shadow="hover" class="list-card">
        <table ref="multipleTableRef">
            <thead class="project-table-head">
                <tr>
                    <th>Projects<el-button @click="this.show = !this.show;" class="add-project-btn">
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
                <el-select v-model="selected" effect=dark class="m-2" placeholder="Select project" size="large">
                    <el-option v-for="project in activeProjects" :key="project.id" :label="project.name"
                        :value="project.id" @click="activate(project)"><span>{{  project.name  }}</span>
                        <span style="float: right; color: #8492a6; font-size: 13px">{{  project.currentIndex  }}</span>
                    </el-option>
                </el-select>
                <el-input-number v-model="num" :min="0" :max="99999" controls-position="right" size="large"
                    @change="handleChangeNum"></el-input-number>
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

let form = reactive({
    name: '',
    executableName: '',
    startArgs: '',
    stopArgs: '',
    show: true
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
        activate(selectedProject) {
            this.selectedProject = selectedProject;
            this.num = this.selectedProject.currentIndex;
            this.postCurrent();
            this.deactivateOldCurrent();
        },
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
            newActiveData.current = true;

            let id = newActiveData.id;
            let requestOptions = {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "Connection": "keep-alive"
                },
                body: JSON.stringify(newActiveData)
            };
            fetch('http://localhost:3000/projects/' + id, requestOptions);
        },
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
            let id = newInactiveData.id;
            let requestOptions = {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "Connection": "keep-alive"
                },
                body: JSON.stringify(newInactiveData)
            };
            fetch('http://localhost:3000/projects/' + id, requestOptions);
        },
        postChanges() {
            let newData = this.selectedProject;
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
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                    "Connection": "keep-alive"
                },
                body: JSON.stringify(newData)
            };
            fetch('http://localhost:3000/projects/' + id, requestOptions);
        }
    }
}
</script>