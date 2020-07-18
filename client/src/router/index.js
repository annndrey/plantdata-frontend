import Vue from 'vue'
import Router from 'vue-router'
import Stats from '@/components/Stats'
import Sensors from '@/components/Sensors'
import Images from '@/components/Images'
import Greenhouse from '@/components/Greenhouse'
import Login from '@/components/Login'
import Logout from '@/components/Logout'

Vue.use(Router)

export default new Router({
    mode: 'history',
    routes: [
	{
	    path: '/',
	    name: 'Stats',
	    component: Stats
	},
	{
	    path: '/greenhouse/:id',
	    name: 'Greenhouse',
	    component: Greenhouse,
	    props: true
	},
	{
	    path: '/sensors/:id',
	    name: 'Sensors',
	    component: Sensors,
	    props: true
	},
	{
	    path: '/images/:id',
	    name: 'Images',
	    component: Images,
	    props: true
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
