<template>
  <div class="detailspage">
    <div class="container">

      <div class="row">
	<div class="col-md-12">
	  <h5>Climatic Data Overview</h5>
	</div>
      </div>
      
      <div class="row">
	<div class="col-md-12">
	  <greenhouse-nav ></greenhouse-nav>
	</div>
      </div>
    </div>

    <div class="row w-110 panelplot">
      <div class="col-md-12">
	
	<div class="container">
	  <div class="row">
	    <div class="col-md-12">
	      <widget-nav @activeItemChanged="changeWidget" parent="sensors"></widget-nav>
	    </div>
	  </div>
	</div>

	<div class="container container-rounded" id="parent-svg-container">

	  <div class="row">
	    <div class="col-md-12 mt-2">
	      <button type="button" class="btn btn-outline-primary btn-sm ml-1" style="background-color: transparent important!;"v-for="(val, ind) in probes" :key="val" @click="modifyData(ind, $event)">
		Sensor Module #{{val}}
	      </button>
	    </div>
	  </div>

	  <div class="row mt-1">
	    <div class="col-md-12">
	  
	      <span v-show="activeItem == 'barchart'">
		<div class="row">
		  <div class="col-md-12" id="sensorbuttons">
		  </div>
		</div>
		<LineChart title="Line Chart" xKey="name" yKey="amount" :data="plotData" :probedata="probes"/>
	      </span>

	    </div>
	  </div>
	  
	  <div class="row">
	    <div class="col-md-12">
	      <span v-show="activeItem == '3d'">
		<DensityChart title="Density Chart" :data="plotData" :probedata="probes" :probescoords="probesCoords" :parmax="parMax" :svgWidth="svgwidth"/>
	      </span>
	  
	      <span v-show="activeItem == 'flag'">
		table with warnings
	      </span>

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
import LineChart from '@/components/LineChart'
import DensityChart from '@/components/DensityChart'

export default {
    name: 'Sensors',
    props: ['id'],
        components: {
	    GreenhouseNav,
	    WidgetNav,
	    LineChart,
	    DensityChart
    },
    data () {
	return {
	    activeItem: null,
	    uuid: null,
	    plotData: null,
	    fullData: null,
	    probes: null,
	    selectedProbes: null,
	    probesCoords: null,
	    svgwidth: null,
	    parMax: null,
	    error: ''
	}
    },
    computed: {
	...mapGetters({ currentUser: 'currentUser', selectedDate: 'selectedDate'})
    },    
    created () {
	console.log("sensors")
    },
    updated () {
    },
    watch: {
	selectedDate (newDate, oldDate) {
	    this.fetchData()
	}
    },
    methods: {
	modifyData(ind, event) {
	    event.target.classList.toggle('greytext')
	    if (this.selectedProbes.includes(ind)) {
		var index = this.selectedProbes.indexOf(ind)
		this.selectedProbes.splice(index, 1)
	    } else {
		this.selectedProbes.push(ind)
	    }
	    
	    var tempData = {...this.fullData}
	    tempData.data = {}
	    Object.keys(this.fullData.data).map( k => {
		var probe = k.split(" ")[1]
		if (this.selectedProbes.includes(probe)) {
		    tempData.data[k] = this.fullData.data[k]
		}
	    })
	    
	    this.plotData = tempData
	},
	findMax(data) {
	    //console.log("Max", data)
	    let prnames = []
	    let paramsMax = {}
	    
	    Object.keys(data.data).map( k => {
		let key = k.split(" ")[0]
		if (!prnames.includes(key)) {
		    prnames.push(key)
		}
	    })
	    prnames.map( pn => {
		Object.keys(data.data).map(k => {
		    if (k.startsWith(pn)) {
			let localmax = Math.max(...data.data[k])
			if (paramsMax[pn] ) {
			    if (paramsMax[pn] <= localmax) {
				paramsMax[pn] = localmax
			    }
			} else {
			    paramsMax[pn] = localmax
			}
		    }
		})
	    })
	    //console.log("Max", paramsMax)
	    this.parMax = paramsMax
	    
	},
	preformatData(data){
	    let outdata = {}
	    let indices = {}
	    var prindex = 1
	    this.selectedProbes = []
	    let probes = Object.keys(data.data).map( (k, ind)  => {
		let [sens, probe] = k.split(" ")
		
		if (!Object.keys(indices).includes(probe)) {
		    indices[probe] = prindex
		    prindex++
		    this.selectedProbes.push(probe)
		}
	    })
	    this.probes = indices
	},
	changeWidget(value) {
	    this.activeItem = value.activeItem
	    this.uuid = value.uuid
	},
	fetchData() {
	    this.svgwidth = document.getElementById("parent-svg-container").offsetWidth/2
	    let params = {}
	    let probeparams = {}
	    console.log("Fetch Data")
	    params.ts_from = moment(this.selectedDate.start).unix()
	    params.ts_to = moment(this.selectedDate.end).unix()
	    params.unixdate = 1
	    params.compact = 1
	    params.dataonly = 1
	    if ( this.uuid ) {
		params.suuid = this.uuid
		probeparams.suuid = this.uuid
	    }
	    
	    //get probes coords
	    
	    this.$axios.get(this.$backendhost+'probes', { params: probeparams })
		.then(request => {
		    this.probesCoords = {}
		    request.data.map( obj => {
			let coords = {}
			coords.x = obj.x
			coords.y = obj.y
			coords.z = obj.z
			this.probesCoords[obj.uuid] = coords
		    })
		})
		.then( req => {
		    this.$axios.get(this.$backendhost+'data', { params: params })
			.then(request1 => {
			    this.plotData = request1.data.data
			    this.fullData = {...this.plotData}
			    this.preformatData(request1.data.data)
			    this.findMax(request1.data.data)
			}
			     )
			.catch(request => console.log(request1))
		})
		.catch(request => console.log(request))
	    
	    //get data
	    
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
  
</style>
