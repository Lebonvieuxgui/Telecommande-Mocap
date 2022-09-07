import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import drag from "v-drag"

loadFonts()
const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(router)
app.use(vuetify)
app.use(drag)
app.mount('#app')
