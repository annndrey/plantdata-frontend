<template>
  <nav class="navbar navbar-expand-sm fixed-top navbar-light bg-light" style="background-color: #fbb040 !important;">
    <a class="navbar-brand" href="http://fermata.tech/" style="color: rgba(0, 0, 0, 0.5);"><img src="@/assets/fermata_logo_wide.png" height="40px"></a>

    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#collapseMenu" aria-controls="collapseMenu" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="collapseMenu">
      <ul class="navbar-nav mr-auto">
	<li v-if="currentUser" class="nav-item">
	  <router-link @click.native="closeMenu($event)" class="btn nav-link" :to="{ name: 'MainPage' }"> Main Page </router-link>
	</li>
	<li v-if="currentUser" class="nav-item">
	  <router-link @click.native="closeMenu($event)" class="btn nav-link" to="/logout"> Logout </router-link>
	</li>
	<li v-else class="nav-item">
	  <router-link @click.native="closeMenu($event)" class="btn nav-link" to="/login"> Login </router-link>
	</li>
      </ul>
      
      <span v-if="currentUser" class="navbar-text">
	<span class="badge" style="background-color: #b4b5b4 !important;">{{ currentUser.name }}</span>
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

<style lang="scss" scoped>


</style>
