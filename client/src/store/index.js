import Vue from 'vue'  
import Vuex from 'vuex'

import auth from './auth'
import * as MutationTypes from '@/store/mutation-types'

Vue.use(Vuex)

const state = {  
    // single source of data
    user: null,
    selected_date: null
}

const actions = {  
    // asynchronous operations
    login ({ commit }) {
	commit(MutationTypes.LOGIN)
    },
    
    logout ({ commit }) {
	commit(MutationTypes.LOGOUT)
    },
    change_date ({commit}, value) {
	//console.log('commit', value)
	commit(MutationTypes.CHANGE_DATE, value)
    },
    
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
    },
    [MutationTypes.CHANGE_DATE] (state, value) {
	//console.log("vuex date change", value)
	state.selected_date = value
	//console.log("vuex date change", state.selected_date)
    }
}

const getters = {  
    // reusable data accessors
    currentUser (state) {
	return state.user
    },
    selectedDate (state) {
	return state.selected_date
    }
}


const store = new Vuex.Store({  
  state,
  actions,
  mutations,
  getters
})

export default store
