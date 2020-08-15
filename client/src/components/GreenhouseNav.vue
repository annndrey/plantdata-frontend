<template>
  <nav class="navbar navbar-expand-sm navbar-light">
    <ul class="navbar-nav mr-auto">
      <li class="nav-item">
	<a class="nav-link" :class="{active: allIsActive}" @click="fetchSensorsStats()">
	  <div class="spinner-grow spinner-grow-sm align-middle" role="status" v-if="allLoading">
	    <span class="sr-only">Loading...</span>
	  </div>
	  All
	</a>
      </li>
      <li class="nav-item" v-for="sensor, index in sensors">
	<a class="nav-link" :key="index" :class="{ active: index === activeItem}" @click="fetchSensorStats(sensor.uuid, index)">
	  <div class="spinner-grow spinner-grow-sm align-middle" role="status" v-if="index=== activeIndex">
	    <span class="sr-only">Loading...</span>
	  </div>
	  Greenhouse #{{index+1}} 
	</a>
      </li>
    </ul>
    <ul class="navbar-nav ml-auto">
      <li class="nav-item">
	<a class="btn btn-white" data-toggle="collapse" href="#collapseDate" role="button" aria-expanded="false" aria-controls="collapseDate">
	  {{ dateFormat() }}
	  <svg width="0.8em" height="0.8\em" viewBox="0 0 16 16" class="bi bi-chevron-down" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
	    <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
	  </svg>
	</a>
	<div class="collapse" id="collapseDate">
	  <div class="card card-body card-white">
	    <v-date-picker
	      mode="range"
	      v-model="daterange"
	      color="green"
	      locale="en"
	      firstDayOfWeek="2"
	      is-inline
	      />
	  </div>
	</div>
      </li>
    </ul>
  </nav>

</template>

<script>
import { mapGetters } from 'vuex'
export default {
    name: 'GreenhouseNav',
    data () {
	return {
	    allLoading: false,
	    sensorLoading: false,
	    allIsActive: false,
	    activeItem: null,
	    daterange: {'start': new Date(), 'end': new Date()},
	    currentdate: null,
	}
    },
    computed: {
	...mapGetters({ currentUser: 'currentUser', selectedDate: 'selectedDate'})
    },    
    created () {
	this.fetchSensorsStats()
    },
    updated () {
    },
    watch: {
	'daterange': function(newVal){
	    let outData = {}
	    outData.activeItem = this.activeItem
	    outData.uuid = this.uuid
	    outData.dateRange = this.daterange
	    this.$store.dispatch("change_date", this.daterange)
	    this.$emit('activeItemChanged', outData)
	},
    },
    methods: {
	showDate(date) {
	    return this.$moment(date).format('DD/MM/YYYY')
	},
	dateFormat() {
	    if (this.showDate(this.daterange.start) == this.showDate(Date()) && this.showDate(this.daterange.end) == this.showDate(Date())) {
		return "today"
	    } else if (this.showDate(this.daterange.start) == this.showDate(this.daterange.end)) {
		return  this.showDate(this.daterange.start)
	    } else {
		return this.showDate(this.daterange.start) + " - " + this.showDate(this.daterange.end)
	    }
	},
	fetchSensorsStats() {
	    //console.log("change date", this.daterange)
	    this.$store.dispatch("change_date", this.daterange)
	    this.allIsActive = !this.allIsActive
	    this.activeItem = 'all'
	    this.allLoading = true
	    let outData = {}
	    outData.activeItem = this.activeItem
	    outData.uuid = null
	    outData.dateRange = this.daterange
	    this.$emit('activeItemChanged', outData)
	    if (this.$route.params.id != this.activeItem) {
		this.$router.replace({ name: this.$route.name, params: {id:this.activeItem} })
		    .catch(()=>{})
	    }
	    this.$axios.get(this.$backendhost+'sensors')
		.then(request => { this.setData('sensors', request)
				   this.allLoading = false
				 }
		     )
		.catch(request => console.log(request))
	    
	},
	fetchSensorStats(uuid, index) {
	    this.allIsActive = false
	    this.activeItem = index
	    this.sensorLoading = true
	    let outData = {}
	    outData.activeItem = this.activeItem
	    outData.uuid = uuid
	    outData.dateRange = this.daterange
	    this.$emit('activeItemChanged', outData)
	    if (this.$route.params.id != this.activeItem) {
		this.$router.replace({ name: this.$route.name, params: {id:this.activeItem} })
		    .catch(()=>{})
	    }
	    this.sensorLoading = false
	},
	setData(what, request) {
	    if (what == "sensors") {
		this.sensors = request.data
	    } 	    
	}
	
    }
}

</script>

<style>
  .card-white {
  background-color: transparent;
  border-color: transparent;
  font-size: 0.8em;
  }
 .btn-white {
  color: black;
  background-color: white;
  border-color: white;
  font-size: 0.6em;
  }
.content {
  position: relative;
  }
  #collapseDate {
  position: absolute;
  z-index: 1;
  right: -135px;
  }  
</style>
