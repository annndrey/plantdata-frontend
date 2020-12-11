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
		  <!--<p class="card-text">
		    <PieChart v-if="overallHealth" radius=50 strokeWidth=7 :percent="overallHealth"/>
		  </p>-->
		  <h6 class="card-title">Overall Plants Health</h6>
		</div>
	      </div>
	      
	      <div class="card rounded">
		<div class="card-body">
		  <p class="card-text">
		    <BarChart v-if="diseasedZones" title="Bar Chart" xKey="name" yKey="amount" :data="diseasedZones"/>
		  </p>
		  <h6 class="card-title">Amount of diseased zones</h6>
		  
		  <router-link  class="btn btn-primary" :to="'/images/' + activeItem">All images</router-link>
		  
		</div>
	      </div>
	      
	      <div class="card rounded">
		<div class="card-body">
		  <h6 class="card-title">Climatic Data</h6>
		  <!--<p class="card-text">
		    <CircleChart v-if="spikes" :amount="spikes"/>
		    <h6 v-if="spikes" >Unusual spikes of sensors data</h6>
		  </p>-->


		  <div id="carouselControls" class="carousel slide" data-ride="false" data-wrap="false" data-interval="false" v-if="basicstats">
		    <div class="carousel-inner">
		      <div class="carousel-item" :class="index == basicstats.length - 1 ? 'active' : ''" :key="index" v-for="(item, index) in basicstats">
			<table class="table smalltable">
			  <thead>
			    <tr>
			      <th scope="col">{{ item.name }}</th>
			      <th scope="col">min</th>
			      <th scope="col">max</th>
			      <th scope="col">mean</th>
			    </tr>
			  </thead>
			  <tbody>
			    <tr v-for="par in item.values">
			      <th scope="row">{{par.name.toUpperCase()}}</th>
			      <td>{{par.min}}</td>
			      <td>{{par.max}}</td>
			      <td>{{par.mean}}</td>
			    </tr>
			  </tbody>
			</table>
			
		      </div>
		    </div>
		    <a class="carousel-control-prev" href="#carouselControls" role="button" data-slide="prev">
		      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
		      <span class="sr-only">Previous</span>
		    </a>
		    <a class="carousel-control-next" href="#carouselControls" role="button" data-slide="next">
		      <span class="carousel-control-next-icon" aria-hidden="true"></span>
		      <span class="sr-only">Next</span>
		    </a>
		  </div>
		  
		  <router-link class="btn btn-primary" :to="'/sensors/' + activeItem">All climate data</router-link>
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
	    spikes: null,
	    basicstats: null
 	}
    },
    created () {
    },
    computed: {
	...mapGetters({ currentUser: 'currentUser'})
    },
    filters: {
	moment_filter: function(date) {
	    let newdate = moment(date).utcOffset("+00:00").format("DD-MM-YY")
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
		    this.basicstats =  request.data.basic_stats
		    console.log(request.data, 'data')
		    
		    //if (request.data == 0) {
			//console.log(request, "no data")
			//this.flashWarning("No data found", {timeout: 2000})
		    //}
		})
		.catch(request => {
		    console.log(request, "error")
		    this.flashWarning("No data found", {timeout: 2000})
		})
	    
	}
    }

}
</script>


<style >
  .carousel {
  font-size: 0.8em;
  }
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
  .mylist {
      text-align: right;
  }
  .smalltable {
      width: 60%;
      font-size: 0.8em;
      margin-left: 2.5rem;
      color: white;
  }
  @-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } }
  @-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }
  @keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }
</style>
