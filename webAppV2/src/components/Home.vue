<template>
  <div class="background">
    <div class="common-layout">
      <el-header class="home-header">SolidRemote
        <div class="active-project-display" v-if="selectedProject !== null"><span
            style="margin-left:50px; float: right; color: #79031D; font-size: 30px">{{  this.selectedProject.name 
            }}</span></div>
      </el-header>
      <el-main>
        <div><MainRemote /></div>
        <div><ProjectsList /></div>
        <div><ScriptsList /></div>
        <div><Notifications /></div>
      </el-main>
    </div>
  </div>
</template>

<script>
import Overlay from 'vuejs-overlay';
import ScriptsList from "./ScriptsList.vue";
import MainRemote from "./MainRemote.vue";
import ProjectsList from "./ProjectsList.vue";
import Notifications from "./Notifications.vue";
import drag from "v-drag"


export default {
  name: "SolidRemoteHome",
  data() {
    return {
      activeProjects: [],
      selectedProject: null,
    }
  },
  async mounted() {
    let self = this;

    const data = await fetch("http://localhost:3000/projects");
    const newData = await data.json();
    this.activeProjects = newData;
    for (let i = 0; i < this.activeProjects.length; i++) {
      if (this.activeProjects[i].current === true) {
        this.selectedProject = this.activeProjects[i];
      }
    }
  }
}

</script>

<style>
@import "./styles/style.css"
</style>

