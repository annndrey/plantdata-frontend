<template>
  <nav class="navbar navbar-expand-sm fixed-top navbar-light border-bottom">
    <a class="navbar-brand" href="http://fermata.tech/" style="color: white;"><img src="@/assets/logo.svg" height="30px"></a>

    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#collapseMenu" aria-controls="collapseMenu" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="collapseMenu">
      <ul class="navbar-nav mr-auto">
	<li v-if="currentUser" class="nav-item" >
	  <router-link @click.native="closeMenu($event)" class="btn btn-primary nav-link" :to="{ name: 'Stats' }"> Main Page </router-link>
	</li>
	<li v-if="currentUser" class="nav-item">
	  <router-link @click.native="closeMenu($event)" class="btn btn-primary nav-link" to="/logout"> Logout </router-link>
	</li>
	<li v-else class="nav-item">
	  <router-link @click.native="closeMenu($event)" class="btn btn-primary nav-link" to="/login"> Login </router-link>
	</li>
      </ul>
      
      <span v-if="currentUser" class="navbar-text" style="color: #white !important;">
	<span >
	  <svg width="1.5em" height="1.5em" viewBox="0 0 16 16" class="bi bi-person" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
	    <path fill-rule="evenodd" d="M13 14s1 0 1-1-1-4-6-4-6 3-6 4 1 1 1 1h10zm-9.995-.944v-.002.002zM3.022 13h9.956a.274.274 0 0 0 .014-.002l.008-.002c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664a1.05 1.05 0 0 0 .022.004zm9.974.056v-.002.002zM8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
	  </svg>
	  {{ currentUser.name }}
	  <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-chevron-down" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
	    <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
	  </svg>
	</span>
      </span>
    </div>
  </nav>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
    name: 'Navbar',
    computed: {
	...mapGetters({ currentUser: 'currentUser'}),
    },
    methods: {
        closeMenu($event) {
	    $($event.currentTarget).closest('.navbar-collapse').collapse('hide')
        }
    }
}
</script>

<style>
.navbar-text {
    font-size: 0.8em;
}

</style>
