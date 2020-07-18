<template>
  <div class="greenhouse">
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    name: 'Greenhouse',
    data () {
	return {
	    email: '',
	    password: '',
	    error: ''
	}
    },
    computed: {
	...mapGetters({ currentUser: 'currentUser'})
    },    
    created () {
    },
    updated () {
    },
    methods: {
    }
}

</script>

<style>
</style>
