import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import VueGridLayout from 'vue-grid-layout'
import { GridItem, GridLayout } from 'vue-grid-layout'
import mitt from 'mitt'

/* Loading fonts from Google Fonts. */
loadFonts()

/* Creating a new instance of the mitt library. */
const emitter = mitt()

/* Creating a new instance of the Vue application. */
const app = createApp(App);

/* Registering all the components in the ElementPlusIconsVue library as global components. */
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

/* Setting a global variable that can be accessed from any component. */
app.config.globalProperties.$globalFilename = 'null_FILENAME'

/* Setting a global variable that can be accessed from any component. */
app.config.globalProperties.$globalActiveProject = reactive({"id": 0, "name": "", "currentIndex": 0, "current": false})

/* Setting a global variable that can be accessed from any component. */
app.config.globalProperties.emitter = emitter

/* Registering the router, vuetify and VueGridLayout plugins. */
app.use(router)
app.use(vuetify)
app.use(VueGridLayout)

/* Mounting the Vue application to the `#app` element in the `index.html` file. */
app.mount('#app')