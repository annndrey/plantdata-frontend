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

	      <span v-if="camerasTimeRange">Greenhouse layout with camera pictures<span>
	      
	      <HeatMap v-if="currentHeatmapZone" title="HeatMap" xKey="name" yKey="amount" :data="currentHeatmapZone" :dimX="dimX" :dimY="dimY" :campositions="cameraImagery"/>  <!--@camIdChanged="updateCamID"/>-->
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
		      <th scope="col">Detected zones</th>
		      <th scope="col">Overall health</th>
		    </tr>
		  </thead>
		  <tbody>
		    <tr v-for="(row, index) in cameraImagery" :key="modal+index">
		      <td class="align-middle">
			<a href="#" data-toggle="modal" :data-target="'#imageModal'+index" @click="updateCanvasInfo(index, row.results)">
			  <img class="table-image" :src="row.imagery">
			</a>
			
			<div class="modal fade" :id="'imageModal'+index" tabindex="-1" :aria-labelledby="'imageModalLabel'+index" aria-hidden="true">
			  <div class="modal-dialog modal-dialog-centered modal-lg">
			    <div class="modal-content">
			      <div class="modal-body">
				<div class="canvas-wrapper">
				  <img :ref="'image'+index" :id="'image'+index" class="modal-image" v-lazy="row.fullsize"  alt="…" >
				  <canvas :ref="'canvas'+index" :id="'canvas'+index" class="canvas-overlay"></canvas>
				</div>
			      </div>
			      <div class="modal-footer">
				<a target="_blank" rel="noopener noreferrer" class="btn btn-secondary" :href="row.fullsize" role="button">View fullsize</a>
				<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
			      </div>
			    </div>
			  </div>
			</div>
		      </td>
		      <td class="align-middle">{{row.greenhouse}}</td>
		      <td class="align-middle">{{row.location}}</td>
		      <td class="align-middle">{{row.position}}</td>
		      <td class="align-middle">{{row.time | moment_time_filter }}</td>
		      <td class="align-middle">{{row.warnings}}</td>
		      <td class="align-middle">{{row.health.toFixed(2)}}</td>
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
	    dimY: null,
	    currentInd: null,
	    currentRes: null
	}
    },
    computed: {
	...mapGetters({ currentUser: 'currentUser', selectedDate: 'selectedDate'})
    },    
    created () {
    },
    mounted () {
	//this.$nextTick(() => {
	this.$Lazyload.$on('loaded', this.redrawCanvas)
	//})
    },
    beforeDestroy(){
	//this.$Lazyload.$on('loaded', null)
	//console.log('destroy', this.$refs)
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
	updateCanvasInfo(ind, res) {
	    this.currentInd = ind
	    this.currentRes = res
	},
	redrawCanvas(event) {
	    //this.$nextTick(() => {
	    this.$nextTick(() => {
		this.drawCanvas(this.currentInd, this.currentRes)
	    })
	    //  })
	},
	drawCanvas(ind, res) {
	    this.$nextTick(() => {
		
		//console.log("Canvas", ind, this.$Lazyload)
		//console.log(res)
		//console.log("IMG2", this.$refs)
		//let c = document.getElementById('canvas'+ind)
		//let img = document.getElementById('image'+ind)
		let c = this.$refs['canvas'+ind][0]
		let img = this.$refs['image'+ind][0]
		//console.log("IMG0", img.naturalWidth)
		//console.log("IMG1", img.width)
		//console.log("IMG3", imag)
		//console.log("IMG4", cnv)
		//console.log("IMG", img.naturalWidth, img.naturalHeight)
		c.width = img.naturalWidth
		c.height = img.naturalHeight
		//console.log("WH", c.width, c.height)
		
		var ctx = c.getContext("2d")
		ctx.clearRect(0,0,c.width,c.height)
		ctx.lineWidth = 8
		ctx.font = "italic 30pt Arial";
		ctx.textBaseline="top"
		
		res.forEach(function(coords, index) {
		    let region = coords.region
		    let results = coords.result
		    let textres = []
		    let regioncolor = "#4CB066"
		    if ( results.State == "unhealthy" ) {
			regioncolor = "#F05648"
		    }
		    ctx.strokeStyle = regioncolor
		    ctx.fillStyle = regioncolor		
		    // rect 
		    ctx.beginPath()
		    ctx.rect(region[0]+8, region[1]-8, region[2]-region[0]-8, region[3]-region[1]-8)
		    ctx.stroke()
		    //results text
		    if (results.Object) {
			textres.push(results.Object)
                    }
                    //if (results.State) {
			//textres.push(results.State)
                    //}
                    if (results.Diagnosis) {
			if (results.Diagnosis != "unknown") {
                            textres.push(results.Diagnosis)
			}
                    }
		    //text background
		    ctx.globalAlpha = 0.3
		    ctx.fillRect(region[0], region[1], region[2]-region[0], 35)
		    ctx.globalAlpha = 1
		    ctx.fillStyle = "white"
		    
		    ctx.fillText(textres.join(", "), region[0]+10, region[1])
		    ctx.fillStyle = regioncolor		
		    
		})
	    })
	},
	updateCamID(value) {
	    this.currentCamID = value.camid
	    this.cameraImagery = null
	    console.log("cameras", this.currentCamID)
	    this.$axios.get(this.$backendhost+'cameras/' + this.currentCamID)
		.then(request => {
		    this.cameraImagery = []
		    request.data.positions.map(d => {
			if (d.pictures[0]) {
			    let datarow = {}
			    let hlth = 0
			    if (d.pictures[0].health) {
				hlth = d.pictures[0].health == 100 ? d.pictures[0].health : d.pictures[0].health
			    }
			    datarow.imagery = d.pictures[0].preview
			    datarow.fullsize = d.pictures[0].fpath
			    datarow.greenhouse = value.camlocation
			    datarow.location = value.camlabel
			    datarow.position = d.poslabel
			    datarow.time = d.pictures[0].ts
			    datarow.warnings = d.pictures[0].numwarnings
			    datarow.results = JSON.parse(d.pictures[0].results)
			    datarow.health = hlth
			    datarow.posx = d.x
			    datarow.posy = d.y
			    this.cameraImagery.push(datarow)
			}
		    })
		}
		     )
		.catch(request => console.log(request))
	    
	},
	updateBarplotDate(value) {
	    this.barplotDate = value
	    let params = {}
	    params.ts_from = moment(value.name).unix()
	    params.ts_to = params.ts_from
	    if ( this.uuid ) {
		params.suuid = this.uuid
	    }
	    console.log("HTM UPD", params)
	    this.$axios.get(this.$backendhost+'locationwarnings', { params: params })
		.then(request => {
		    this.heatmapZones = request.data
		    this.heatmapIndex = 0
		    this.heatmapCount = Object.keys(this.heatmapZones).length
		    this.currentHeatmapZone = this.heatmapZones[Object.keys(this.heatmapZones)[this.heatmapIndex]]
		    if (this.currentHeatmapZone) {
			this.camerasTimeRange = this.currentHeatmapZone[0].ts
		    }
		    console.log("Update cameras", this.currentHeatmapZone)
		    // TODO: Fix for multiple cameras
		    this.updateCamID(this.currentHeatmapZone[0])
		})
	    	.catch(request => console.log(request))
	},
	changeHeatmapZone() {
	    this.currentHeatmapZone = this.heatmapZones[Object.keys(this.heatmapZones)[this.heatmapIndex]]
	    if (this.currentHeatmapZone) {
		// TODO: Fix for multiple cameras
		this.camerasTimeRange = this.currentHeatmapZone[0].ts
		// TODO: Fix for multiple cameras
		this.updateCamID(this.currentHeatmapZone[0])
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
  .canvas-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      width: 100%;
      height: 100%
  }
  .canvas-wrapper {
    position: relative;
  }
</style>
