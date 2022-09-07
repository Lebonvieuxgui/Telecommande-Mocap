import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import VueGridLayout from 'vue-grid-layout'
import { GridItem, GridLayout } from 'vue-grid-layout'
import mitt from 'mitt'

loadFonts()
const emitter = mitt()
const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.config.globalProperties.$globalFilename = 'null_FILENAME'
app.config.globalProperties.$globalActiveProject = reactive({"id": 0, "name": "", "currentIndex": 0, "current": false})
app.config.globalProperties.emitter = emitter
app.use(router)
app.use(vuetify)
app.use(VueGridLayout)
app.mount('#app')