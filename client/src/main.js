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
import Vue2Filters from 'vue2-filters'
import _ from 'lodash'
import VueLazyload from 'vue-lazyload'


var VueCookie = require('vue-cookie');
var linearInterpolator = require('linear-interpolator')
var kdtree = require('kd-tree-javascript')
var TPS = require('thinplate')

Vue.use(window.VueCharts)
Vue.use(VCalendar)
Vue.config.productionTip = false
// Setting up Axios on Vue Instance, for use via this.$axios
Vue.prototype.$axios = axios.create(axiosConfig);
Vue.prototype.$axios.defaults.headers.common.Authorization = `Bearer ${localStorage.getItem('token')}`;
Vue.prototype.$backendhost = 'https://host:port/api/v2/'
Vue.prototype._ = _
const moment = require('moment')
require('moment/locale/ru')
require('vue-flash-message/dist/vue-flash-message.min.css');
Vue.use(require('vue-moment'), {
    moment
})
Vue.use(VueFlashMessage, { timeout: 2000 });
Vue.use(VueCookie);
Vue.use(linearInterpolator);
Vue.use(kdtree);
Vue.use(VueLazyload)
Vue.use(TPS)

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
}).$mount('#app')
