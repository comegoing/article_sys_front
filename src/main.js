import Vue from "vue";
import App from "./App.vue";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/antd.css";
import moment from 'moment'
import 'moment/locale/zh-cn'
moment.locale('zh-cn')

Vue.config.productionTip = false;
Vue.use(Antd);

new Vue({
  render: (h) => h(App),
}).$mount("#app");
