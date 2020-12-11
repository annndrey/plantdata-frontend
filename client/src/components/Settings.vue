<template>
  <div class="settingsspage">
    <div class="container-fluid">

      <div class="row">
	<div class="col-md-12">
	  <h5>
	    Settings
	  </h5>
	  <div class="spinner spinner-border text-success" role="status" v-if="loadingdata">
	    <span class="sr-only">Loading...</span>
	  </div>

	</div>
      </div>

    <div class="row w-110 panelplot mb-4">
      <div class="col-md-12">
	
	<div class="container container-rounded">
	  <div class="row mt-4">
	    <div class="col-md-12">
	      Probe Limits
	    </div>
	  </div>
	  
	  <div class="row mt-4">
	    
	    <div class="col-md-12" v-for="(rec, index) in sensortypes">
	      <form class="form-inline" v-for="par in rec.values">
		<div class="form-group mb-2">
		  <label for="staticPar" class="sr-only">Sensor Type </label>
		  <input type="text" readonly class="form-control-plaintext" id="staticPar" v-model="par">
		</div>
		<div class="form-group mx-sm-3 mb-2">
		  <label for="inputMin" class="sr-only">Min value</label>
		  <input class="form-control" id="inputMin" placeholder="Min value" v-model="rec.limits[par].minvalue">
		</div>
		<div class="form-group mx-sm-3 mb-2">
		  <label for="inputMax" class="sr-only">Max value</label>
		  <input  class="form-control" id="inputMax" placeholder="Max value" v-model="rec.limits[par].maxvalue">
		</div>
		<button type="button" class="btn btn-primary mb-2" @click="modifyLimits(rec.suuid, par, rec.limits[par].minvalue, rec.limits[par].maxvalue)" >Save</button>
	      </form>

	    </div>
	  </div>

	</div>
      </div>
      
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'

export default {
    name: 'Settings',
    props: ['id'],
    components: {
    },
    data () {
	return {
	    uuid: null,
	    plotData: null,
	    loadingdata: false,
	    sensortypes: null,
	}
    },
    computed: {
	...mapGetters({ currentUser: 'currentUser', selectedDate: 'selectedDate'})
    },    
    created () {
	this.fetchData()
    },
    updated () {
    },
    watch: {
    },
    methods: {
	fetchData() {
	    this.loadingdata = true
	    console.log("settings")
	    this.$axios.get(this.$backendhost+'sensortypes')
		.then(request => {
		    this.sensortypes = request.data
		})
		.catch(request => {
		    console.log(request)
		})
	    this.loadingdata = false
	},
	modifyLimits(suuid, par, minval, maxval) {
	    console.log("Save limits", suuid, par, minval, maxval)
	    var params = {'suuid': suuid, 'ptype': par}
	    
	    if (minval) {
		params['minvalue'] = minval
	    }
	    if (maxval) {
		params['maxvalue'] = maxval
	    }
	    //if (maxval || minval) { 
	    console.log(params)
	    this.$axios.post(this.$backendhost+'sensorlimits',  params)
		.then(request => this.flashSuccess("Data saved", {timeout: 10000}))
	    	.catch(request => this.flashWarning("Network error", {timeout: 10000}))
	    //}
	}
    }
}

</script>

<style>
  h5 {
  color: white
  }
  .container-rounded {
      background-color: white;
      border-radius: 30px;
  }
  .btn.btn-outline-primary.btn-sm.ml-1.greytext {
      color: lightgrey;
      
  }
  .btn-outline-primary {
      border-color: transparent;
      color: #1f6c39;
      border-radius: 13px;
      background-color: #f6f7f9;
      //font-size: 0.6em;
	    
  }
  .btn-outline-primary:hover {
      background-color: #1f6c39;
      color: white;
  }
  .spinner {
      display: block;
      position: fixed;
      z-index: 1031; /* High z-index so it is on top of the page */
      top: 50%;
      right: 50%; /* or: left: 50%; */
      margin-top: -..px; /* half of the elements height */
      margin-right: -..px; /* half of the elements widht */
  }  
</style>
