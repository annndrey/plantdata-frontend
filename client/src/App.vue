<template>
<div id="other">
  <navbar></navbar>
  <div class="container-fluid">
    <router-view></router-view>
  </div>

</div>
</template>

<script>
import axios from 'axios'
import Navbar from '@/components/Navbar'
import Foot from '@/components/Foot'
import { mapGetters } from 'vuex'

export default {
    name: 'other',
    computed: {
	...mapGetters({ currentUser: 'currentUser' })
    },
    created () {
	this.checkCurrentLogin()
    },
    updated () {
	this.checkCurrentLogin()
    },
    methods: {
	checkCurrentLogin () {
	    if (!localStorage.user) {
		this.$router.push('/login')
	    } else {
		this.$store.dispatch('login')
	    }
	}
    },
  components: {
      Navbar,
      Foot
  }
}
</script>

<style>
#other {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
