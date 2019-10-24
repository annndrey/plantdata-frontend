const axiosConfig = {
    timeout: 30000,
    withCredentials: false
};

import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import VueFlashMessage from 'vue-flash-message';
import router from './router'
import store from './store'
import 'chart.js'
import 'hchs-vue-charts'
import VCalendar from 'v-calendar';

var VueCookie = require('vue-cookie');

Vue.use(window.VueCharts)
Vue.use(VCalendar)
Vue.config.productionTip = false
// Setting up Axios on Vue Instance, for use via this.$axios
Vue.prototype.$axios = axios.create(axiosConfig);
Vue.prototype.$axios.defaults.headers.common.Authorization = `Bearer ${localStorage.getItem('token')}`;
Vue.prototype.$backendhost = 'https://plantdata.fermata.tech:5498/api/v1/'

const moment = require('moment')
require('moment/locale/ru')
require('vue-flash-message/dist/vue-flash-message.min.css');
Vue.use(require('vue-moment'), {
    moment
})
Vue.use(VueFlashMessage, { timeout: 2000 });
Vue.use(VueCookie);


new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
}).$mount('#app')

//window.appVue = new Vue({ router, store, render: (h) => h(App), }).$mount('#app');
