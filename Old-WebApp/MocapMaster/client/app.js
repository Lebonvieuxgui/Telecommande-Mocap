import Vue from "vue";
import router from "./router/index";
import store from "./store/index";

import AppLayout from "./components/Layout.vue";
import Vuelidate from "vuelidate";

// ElementUI

// FontAwesome
import "@fortawesome/fontawesome";
import "@fortawesome/fontawesome-free-solid";

import VueClipboard from "vue-clipboard2";

import {
  Row,
  Col,
  MessageBox,
  Message,
  Notification,
  Loading
} from "element-ui";

Vue.use(Row);
Vue.use(Col);

Vue.use(Loading.directive);

Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;
Vue.prototype.$notify = Notification;
Vue.prototype.$message = Message;

Vue.use(Vuelidate);
Vue.use(VueClipboard);

const app = new Vue({
  router,
  store,
  ...AppLayout
});

export const bus = new Vue();

export { app, router, store };
