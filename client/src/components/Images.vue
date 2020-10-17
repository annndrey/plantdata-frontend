<template>
  <div class="detailspage">
    <div class="container">

      <div class="row">
	<div class="col-md-12">
	  <h5>AI Disease Recognition Overview</h5>
	</div>
      </div>
      
      <div class="row">
	<div class="col-md-12">
	  <greenhouse-nav @activeItemChanged="updateParams"></greenhouse-nav>
	</div>
      </div>
    </div>

    <div class="row w-110 panelplot">
      <div class="col-md-12">
	
	<div class="container">
	  <div class="row">
	    <div class="col-md-12">
	      <widget-nav @activeItemChanged="changeWidget" parent="images"></widget-nav>
	    </div>
	  </div>
	</div>

	<div class="container container-rounded">
	  
	  <div class="row">
	    <div class="col-md-12">
	      <AdvancedBarChart v-if="diseasedZones" title="Bar Chart" xKey="name" yKey="amount" :data="diseasedZones" @barDateChanged="updateBarplotDate"/>
	    </div>
	  </div>
	  
	  <div class="row">
	    <div class="col-md-12">
	      <form>
		<div class="form-group">
		  <label for="formControlRange">
		    <span v-if="barplotDate" >Images collection time selector</span>
		    <span v-if="camerasTimeRange"> <small> showing images for {{barplotDate.name | moment_date_filter}} {{camerasTimeRange | moment_time_filter}}</small><span>
		  </label>
		  <input type="range" v-model="heatmapIndex" min="0" :max="heatmapCount-1" @change="changeHeatmapZone" class="form-control-range" id="formControlRange">
		</div>
	      </form>

	      <span v-if="camerasTimeRange">Greenhouse layout with camera pictures <small class="text-muted">click on camera to see collected pictures</small><span>
	      
	      <HeatMap v-if="currentHeatmapZone" title="HeatMap" xKey="name" yKey="amount" :data="currentHeatmapZone" :dimX="dimX" :dimY="dimY"  @camIdChanged="updateCamID"/>
	    </div>
	  </div>
	  
	  <div class="row" v-if="camerasTimeRange">
	    <div class="col-md-12">
	      <small>
		<table class="table table-hover">
		  <thead>
		    <tr>
		      <th scope="col">Imagery</th>
		      <th scope="col">Greenhouse</th>
		      <th scope="col">Location</th>
		      <th scope="col">Position</th>
		      <th scope="col">Time</th>
		      <th scope="col">Zone reprated cases</th>
		    </tr>
		  </thead>
		  <tbody>
		    <tr v-for="(row, index) in cameraImagery" :key="modal+index">
		      <td class="align-middle">
			<a href="#" data-toggle="modal" :data-target="'#imageModal'+index">
			  <img class="table-image" :src="row.imagery">
			</a>
			
			<div class="modal fade" :id="'imageModal'+index" tabindex="-1" :aria-labelledby="'imageModalLabel'+index" aria-hidden="true">
			  <div class="modal-dialog modal-dialog-centered modal-lg">
			    <div class="modal-content">
			      <div class="modal-body">
				<img class="modal-image" :src="row.fullsize">
			      </div>
			      <div class="modal-footer">
				<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
			      </div>
			    </div>
			  </div>
			</div>
		      </td>
		      <td class="align-middle">{{row.greenhouse}}</td>
		      <td class="align-middle">{{row.location}}</td>
		      <td class="align-middle">{{row.zone}}</td>
		      <td class="align-middle">{{row.time | moment_time_filter }}</td>
		      <td class="align-middle">{{row.warnings}}</td>
		  </tbody>
		</table>
	      </small>
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
import WidgetNav from '@/components/WidgetNav'
import AdvancedBarChart from "@/components/AdvancedBarChart.vue"
import HeatMap from "@/components/HeatMap.vue"
export default {
    name: 'Images',
    props: ['id'],
        components: {
	    GreenhouseNav,
	    WidgetNav,
	    AdvancedBarChart,
	    HeatMap
    },
    data () {
	return {
	    activeItem: null,
	    uuid: null,
	    diseasedZones: null,
	    barplotDate: null,
	    heatmapZones: null,
	    currentHeatmapZone: null,
	    heatmapCount: 0,
	    heatmapIndex: null,
	    currentCamID: null,
	    cameraImagery: null,
	    camerasTimeRange: null,
	    dimX: null,
	    dimY: null
	    
	}
    },
    computed: {
	...mapGetters({ currentUser: 'currentUser', selectedDate: 'selectedDate'})
    },    
    created () {
    },
    updated () {
    },
    filters: {
	moment_date_filter: function(date) {
	    let newdate = moment(date).utcOffset("+00:00").format("DD-MM-YY")
	    return newdate
	},
	moment_datetime_filter: function(date) {
	    let newdate = moment(date).utcOffset("+00:00").format("DD-MM-YY HH:mm")
	    return newdate
	},
	moment_time_filter: function(date) {
	    let newdate = moment(date).utcOffset("+00:00").format("HH:mm")
	    return newdate
	}

    },
    methods: {
	updateCamID(value) {
	    this.currentCamID = value.camid
	    this.cameraImagery = null
	    this.$axios.get(this.$backendhost+'cameras/' + this.currentCamID)
		.then(request => {
		    this.cameraImagery = []
		    request.data.positions.map(d => {
			if (d.pictures[0]) {
			    let datarow = {}
			    datarow.imagery = d.pictures[0].preview
			    datarow.fullsize = d.pictures[0].fpath
			    datarow.greenhouse = value.camlocation
			    datarow.location = value.camlabel
			    datarow.zone = "pos " + d.poslabel
			    datarow.time = d.pictures[0].ts
			    datarow.warnings = d.pictures[0].numwarnings
			    this.cameraImagery.push(datarow)
			}
		    })
		}
		     )
		.catch(request => console.log(request))
	    
	},
	updateBarplotDate(value) {
	    console.log("Date changed", value.name, moment(value.name).unix())
	    this.barplotDate = value
	    let params = {}
	    params.ts_from = moment(value.name).unix()
	    params.ts_to = params.ts_from
	    if ( this.uuid ) {
		params.suuid = this.uuid
	    }
	    console.log(params)
	    this.$axios.get(this.$backendhost+'locationwarnings', { params: params })
		.then(request => {
		    this.heatmapZones = request.data
		    this.heatmapIndex = 0
		    this.heatmapCount = Object.keys(this.heatmapZones).length
		    this.currentHeatmapZone = this.heatmapZones[Object.keys(this.heatmapZones)[this.heatmapIndex]]
		    console.log("Heatmap zone0", this.heatmapCount, this.currentHeatmapZone)
		    if (this.currentHeatmapZone) {
			this.camerasTimeRange = this.currentHeatmapZone[0].ts
		    }
		}
		     )
		.catch(request => console.log(request))


	},
	changeHeatmapZone() {
	    this.currentHeatmapZone = this.heatmapZones[Object.keys(this.heatmapZones)[this.heatmapIndex]]
	    console.log("Heatmap zone1", this.currentHeatmapZone)
	    if (this.currentHeatmapZone) {
		this.camerasTimeRange = this.currentHeatmapZone[0].ts
	    }

	},
	updateParams(value) {
	    this.activeItem = value.activeItem
	    this.uuid = value.uuid
	    this.fetchData()
	},
	changeWidget(value) {
	    console.log("Item changed", value)
	},
	fetchData() {
	    let params = {}
	    params.ts_from = moment(this.selectedDate.start).unix()
	    params.ts_to = moment(this.selectedDate.end).unix()
	    params.output = 'diseased_zones'
	    params.numentries = 24
	    if ( this.uuid ) {
		params.suuid = this.uuid
	    }
	    this.$axios.get(this.$backendhost+'stats', { params: params })
		.then(request => {
		    this.diseasedZones = request.data.diseased_zones
		    var lockey = Object.keys(request.data.locdimensions)[0]
		    this.dimX = request.data.locdimensions[lockey].x
		    this.dimY = request.data.locdimensions[lockey].y
		}
		     )
		.catch(request => console.log(request))
	    
	}
    }
}

</script>

<style>
  .panelplot {
  background: #f6f7f9;
  }
  .navbar-details {
  background: #f6f7f9 !important;
  color: black !important;
  }
  h5 {
  color: white;
  }
  .container-rounded {
      background-color: white;
      border-radius: 30px;
  }
  .table-image {
      height: 35px;
  }
  .modal-image {
      width: 100%;
  }
</style>
