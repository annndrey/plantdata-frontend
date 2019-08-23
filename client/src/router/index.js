import Vue from 'vue'
import Router from 'vue-router'
import MainPage from '@/components/MainPage'
import Login from '@/components/Login'
import Logout from '@/components/Logout'
Vue.use(Router)


export default new Router({
    mode: 'history',
    routes: [
	{
	    path: '/',
	    name: 'MainPage',
	    component: MainPage
	},
	{
	    path: '/login',
	    name: 'Login',
	    component: Login
	},
	{
	    path: '/logout',
	    name: 'Logout',
	    component: Logout
	}
    ]
})
