import Vue from 'vue'  
import Vuex from 'vuex'

import auth from './auth'
import * as MutationTypes from '@/store/mutation-types'

Vue.use(Vuex)

const state = {  
    // single source of data
    user: null
}

const actions = {  
    // asynchronous operations
    login ({ commit }) {
	commit(MutationTypes.LOGIN)
    },
    
    logout ({ commit }) {
	commit(MutationTypes.LOGOUT)
  }
}
	      
	
const mutations = {  
    // isolated data mutations
    [MutationTypes.LOGIN] (state) {
	if (localStorage.user) {
	    state.user = JSON.parse(localStorage.user)
	}
    },
    [MutationTypes.LOGOUT] (state) {
	delete localStorage.token
	delete localStorage.user
	state.user = null
    }
}

const getters = {  
    // reusable data accessors
    currentUser (state) {
	return state.user
    }
}


const store = new Vuex.Store({  
  state,
  actions,
  mutations,
  getters
})

export default store
