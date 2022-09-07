<template>
  <Home />
</template>

<script>
import Home from './components/Home.vue'
import VueGridLayout from 'vue-grid-layout'
import { GridItem, GridLayout } from 'vue-grid-layout'


export default {
  name: 'App',
  components: {
    Home,
    GridLayout: GridLayout,
    GridItem: GridItem
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}
</style>
