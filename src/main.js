import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import VueI18n from 'vue-i18n';

Vue.use(ElementUI);
Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: 'zh',
  messages: {
    'zh': require('./i18n/zh').lang,
    'en': require('./i18n/en').lang
  }
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
