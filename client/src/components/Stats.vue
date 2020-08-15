<template>

<div class="mainpage">
  <div class="container">
    <div class="row">
      <div class="col-md-12">
	<div class="row">
	  <div class="col-md-12 text-left">
	    <h4> {{currentUser.company}}</h4>
	    <greenhouse-nav @activeItemChanged="setActiveItem"></greenhouse-nav>
	  </div>
	</div>

	
	<div class="row">
	  <div class="col-md-12">
	    <div class="card-deck">
	      
	      <div class="card rounded">
		<div class="card-body">
		  <p class="card-text">
		    <PieChart v-if="overallHealth" radius=50 strokeWidth=7 :percent="overallHealth"/>
		  </p>
		  <h6 class="card-title">Overall Plants Health</h6>
		</div>
	      </div>
	      
	      <div class="card rounded">
		<div class="card-body">
		  <p class="card-text">
		    <BarChart v-if="diseasedZones" title="Bar Chart" xKey="name" yKey="amount" :data="diseasedZones"/>
		  </p>
		  <h6 class="card-title">Diseased zones discovered</h6>

		  <router-link class="btn btn-primary" :to="'/images/' + activeItem">Details [AI Images]</router-link>
		  
		</div>
	      </div>
	      
	      <div class="card rounded">
		<div class="card-body">
		  <p class="card-text">
		    <CircleChart v-if="spikes" :amount="spikes"/>
		  </p>
		  <h6 class="card-title">Unusual spikes of Sensors Data</h6>

		  <router-link class="btn btn-primary" :to="'/sensors/' + activeItem">Details [Sensors]</router-link>
		</div>
	      </div>
	      
	    </div>
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
import GreenhouseNav from '@/components/GreenhouseNav'
import PieChart from "@/components/PieChart.vue"
import BarChart from "@/components/BarChart.vue"
import CircleChart from "@/components/CircleChart.vue"
export default {
    name: 'Stats',
    components: {
	GreenhouseNav,
	BarChart,
	PieChart,
	CircleChart
    },
    data: function() {
	return {
	    sensors: null,
	    activeItem: null,
	    uuid: null,
	    overallHealth: null,
	    diseasedZones: null,
	    spikes: null
 	}
    },
    created () {
    },
    computed: {
	...mapGetters({ currentUser: 'currentUser'})
    },
    filters: {
	moment_filter: function(date) {
	    let newdate = moment(date).utcOffset("+00:00").format("DD-MM-YYYY HH:mm")
	    return newdate
	}
    },
    methods: {
	setActiveItem(value) {
	    console.log(value)
	    this.activeItem = value.activeItem
	    this.uuid = value.uuid
	    let params = {}
	    if ( this.uuid ) {
		params.suuid = this.uuid
	    }
	    
	    params.ts_from = moment(value.dateRange.start).unix()
	    params.ts_to = moment(value.dateRange.end).unix()
	    
	    console.log(params)
	    this.$axios.get(this.$backendhost+'stats', { params: params })
		.then(request => {
		    this.overallHealth = request.data.health
		    this.diseasedZones = request.data.diseased_zones
		    this.spikes = request.data.spikes
		    console.log(request.data)
		}
		     )
		.catch(request => console.log(request))
	    
	}
    }

}
</script>


<style >
  .fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to {
  opacity: 0;
  }
  span.error{
  color:#e74c3c;
  font-size:20px;
  display:flex;
  justify-content:center;
  }
  .blank_row
  .statusmessage {
  height: 22px !important; 
  }
  h3 {
  margin: 40px 0 0;
  }
  h6 {
      font-size: 0.8em;
  }
  ul {
  list-style-type: none;
  padding: 0;
  }
  li {
  display: inline-block;
  margin: 0 10px;
  }
  a {
  color: #7fd76b;
  }
  a:hover {
      color:white;
  }
  a.active {
      color:white;
   }
   
  .loading {
      position: fixed;
      top: 50%;
      left: 45%;
      z-index: 30001;
      -webkit-animation:spin 2s linear infinite;
      -moz-animation:spin 2s linear infinite;
      animation:spin 2s linear infinite;
  }
  .rounded {
      border-radius: 0.5em !important;
  }
  
  @-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } }
  @-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }
  @keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }
  
</style>
