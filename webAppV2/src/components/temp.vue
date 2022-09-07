<template>
    <el-card shadow="hover" class="list-card">
        <table ref="multipleTableRef">
            <thead class="project-table-head">
                <tr>
                    <th>Projects</th>
                    <el-button class="add-project-btn">
                        <el-icon><Plus/></el-icon>
                    </el-button>
                </tr>
            </thead>
            <div class="project-table-body">
                <tbody>
                    <tr v-for="project in activeProjects" :key="project.name">
                        <td class="projects">
                            <span @click="activate(project)">{{ project.name }}</span>
                            <el-button size="small" text
                                @click="dialogFormVisible = true, selectProject(project.name, activeprojects)">
                                <el-icon>
                                    <Delete />
                                </el-icon>
                            </el-button>
                        </td>
                    </tr>
                </tbody>
            </div>
        </table>
    </el-card>
</template>

<script>
//import test from 'node:test';
import { reactive, ref } from 'vue'

const dialogFormVisible = ref(false);
const formLabelWidth = '140px';

function sleep(t) {
   return new Promise( resolve => setTimeout( resolve, t ));
}

let form = reactive({
    name: '',
    executableName: '',
    startArgs: '',
    stopArgs: ''
});

export default {
    name: 'projectsList',
    data() {
        return {
            form,
            formLabelWidth,
            dialogFormVisible,
            activeProjects: [],
            loadedExecs: [],
            selectedProject: null,
        }
    },
    async mounted() {
        let self = this;

        const data = await fetch("http://localhost:3000/projects");
        const newData = await data.json();
        this.activeProjects = newData;
    },
    methods: {
        activate(selectedProject) {
            this.selectedProject = selectedProject;
            //this.postCurrent();
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