<template>
<div class="login-wrapper">

  <form class="form-signin" @submit.prevent="login">

    <h2 class="form-signin-heading">Please login</h2>
    <h4><flash-message transition-name="fade"></flash-message></h4>
      <label for="inputEmail" class="sr-only">Email</label>
      <input v-model="email" type="email" id="inputEmail" class="form-control" placeholder="Email" required autofocus>
      <label for="inputPassword" class="sr-only">Password</label>
      <input v-model="password" type="password" id="inputPassword" class="form-control" placeholder="Password" required>
      <button class="btn btn-lg btn-primary btn-block" type="submit">Submit</button>
    </form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    name: 'Login',
    data () {
	return {
	    email: 'demouser@fermata.tech',
	    password: 'demopass',
	    error: ''
	}
    },
    computed: {
	...mapGetters({ currentUser: 'currentUser'})
    },    
    created () {
	this.checkCurrentLogin()
    },
    updated () {
	this.checkCurrentLogin()
    },
    methods: {
	checkCurrentLogin () {
	    if (this.currentUser) {
		this.$router.replace(this.$route.query.redirect || '/')
	    } 
	},
	login () {
	    console.log(this.$backendhost)
	    this.$axios.post(this.$backendhost+'token', {username: this.email, password: this.password} )
		.then(request => this.loginSuccessful(request))
		.catch(request => this.loginFailed(request))
	},
	loginSuccessful (response) {
	    this.error = false
	    var user = { 'token' : response.data.token,
			 'name': response.data.name,
			 'login': response.data.login,
			 'user_id': response.data.user_id
			 }
	    localStorage.user = JSON.stringify(user)
	    localStorage.token = user.token
	    this.$store.dispatch('login')
	    // 
	    this.$axios.defaults.headers.common.Authorization = 'Bearer ' + localStorage.token
	    // if ( this.currentUser.isadmin ) {
		//this.$router.replace( this.$route.query.redirect || '/admin')
	    //} else if ( this.currentUser.superadmin ) {
		//this.$router.replace( this.$route.query.redirect || '/')
	    //}
	    this.$router.replace( this.$route.query.redirect || '/')
	    
	},
	loginFailed (response) {
	    if (!response.response) {
		this.error = ' Network error, server not responding'
		this.flashWarning(this.error, {timeout: 2000})
	    } else {
		this.error = ' Wrong login or password'
		this.flashWarning(this.error, {timeout: 2000})
		this.$axios.defaults.headers.common.Authorization = `Bearer `
		delete localStorage.user
		delete localStorage.token
		this.$store.dispatch('logout')
	    }
	}
    }
}
</script>
<style>
  .fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active до версии 2.1.8 */ {
  opacity: 0;
  }
  span.error{
  color:#e74c3c;
  font-size:20px;
  display:flex;
  justify-content:center;
}
</style>

<style scoped lang="css">
body {
    background: #b4b5b4;
}

.login-wrapper {
    background: #b4b5b4;
    width: 70%;
    margin: 12% auto;
}

.form-signin {
    max-width: 330px;
    padding: 10% 15px;
    margin: 0 auto;
}
.form-signin .form-signin-heading,
.form-signin .checkbox {
    margin-bottom: 10px;
}
.form-signin .checkbox {
    font-weight: normal;
}
.form-signin .form-control {
    position: relative;
    height: auto;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    padding: 10px;
  font-size: 16px;
}
.form-signin .form-control:focus {
    z-index: 2;
}
.form-signin input[type="email"] {
    margin-bottom: -1px;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
}
.form-signin input[type="password"] {
    margin-bottom: 10px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
}
</style>
