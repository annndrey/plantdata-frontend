<template>
  <div class="detailspage">
    <div class="container">

      <div class="row">
	<div class="col-md-12">
	  <h5>
	    Climatic Data Overview
	  </h5>
	  <div class="spinner spinner-border text-success" role="status" v-if="loadingdata">
	    <span class="sr-only">Loading...</span>
	  </div>

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
	      <widget-nav @activeItemChanged="changeWidget" parent="sensors" :plotdata="plotData" :probedata="probes"></widget-nav>
	    </div>
	  </div>
	</div>

	<div class="container container-rounded" id="parent-svg-container">

	  <div class="row">
	    <div class="col-md-12 mt-2" ref="sensorbuttons"  v-show="activeItem != 'flag'">
	      <button type="button" class="btn btn-outline-primary btn-sm ml-1 sensorbutton" style="background-color: transparent important!;"v-for="(val, ind) in probes" :key="val" @click="modifyData(val, $event)">
		Sensor Module #{{val}} row: {{probesCoords[ind].row}} col: {{probesCoords[ind].col}}
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
		<LineChart title="Line Chart" xKey="name" yKey="amount" :data="plotData" :probedata="probes" :limits="sensorlimits"/>
	      </span>

	    </div>
	  </div>
	  
	  <div class="row">
	    <div class="col-md-12">
	      <span v-show="activeItem == '3d'">
		<DensityChart title="Density Chart" :data="plotData" :probedata="probes" :probescoords="probesCoords" :parmax="parMax" :svgWidth="svgwidth"/>
	      </span>
	    </div>
	  </div>

	  <div class="row">
	    <div class="col-md-12">
	      <span v-show="activeItem == 'flag'">

		<small>
		  <table class="table table-hover mt-4">
		    <thead>
		      <tr>
			<th scope="col"></th>
			<th scope="col">Time</th>
			<th scope="col">Label</th>
			<th scope="col">Location</th>
			<th scope="col">Position</th>
			<th scope="col">Value</th>
			<th scope="col">Limits, min, max</th>
		      </tr>
		    </thead>
		    <tbody>
		      <tr v-for="(ntf, index) in currentNotifications" :key="alert+index" class="fade show" v-bind:class="{ 'table-success': ntf.read, 'table-secondaty': ntf.archived }">
			<td class="align-middle"><button type="button" class="btn btn-outline-success btn-sm" @click="markAsRead(ntf.id, index, $event)" >mark as {{ntf.read ? 'unread' : 'read'}}</button></td>
			<td class="align-middle">{{ntf.json_data.ts | moment_time_filter }}</td>
			<td class="align-middle">{{ntf.json_data.ptype.toUpperCase()}}</td>
			<td class="align-middle">{{ntf.json_data.location}}</td>
			<td class="align-middle">{{ntf.json_data.localcoords}}</td>
			<td class="align-middle">{{ntf.json_data.value}}</td>
			<td class="align-middle">{{ntf.json_data.min}}-{{ntf.json_data.max}}</td>
		    </tbody>
		  </table>
		</small>
		
		
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
	    error: '',
	    sensorlimits: false,
	    loadingdata: false,
	    currentNotifications: null
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
	},
	activeItem (newVal, oldVal) {
	    console.log("activeItem", newVal)
	    if (newVal == 'flag') {
		console.log("Fetch warnings")
		this.fetchNotifications()
	    }
	}
    },
    filters: {
	moment_datetime_filter: function(date) {
	    let newdate = moment(date).utcOffset("+00:00").format("DD-MM-YY HH:mm")
	    return newdate
	},
    },
    methods: {
	markAsRead(notif_id, index, event) {
	    let button_txt = event.target.innerHTML
	    event.target.innerHTML == "mark as unread" ? event.target.innerHTML="mark as read" : event.target.innerHTML="mark as unread"
	    
	    let mark_as_read = false
	    if (event.target.parentNode.parentNode.className == "fade show table-success") {
		// read -> unread
		event.target.parentNode.parentNode.className=""
		
	    } else {
		event.target.parentNode.parentNode.className = "fade show table-success"
		mark_as_read = true
		//event.target.innerHTML = "mark as read"
	    }
	    //setTimeout(() => {
		//this.currentNotifications.splice(index,1)
	    var params = {'read': mark_as_read}
	    this.$axios.patch(this.$backendhost+'alerts/'+notif_id, params)
	    //.then(request => {
	    //this.currentNotifications = request.data
	    //})
		.catch(request => {
		    console.log(request)
		})
	    //}, 500)
	    
	},
	fetchNotifications() {
	    this.loadingdata = true
	    this.$axios.get(this.$backendhost+'alerts')
		.then(request => {
		    this.currentNotifications = request.data
		})
		.catch(request => {
		    console.log(request)
		})
	    this.loadingdata = false
	},
	modifyData(plabel, event) {
	    event.target.classList.toggle('greytext')
	    if (this.selectedProbes.includes(plabel)) {
		var index = this.selectedProbes.indexOf(plabel)
		this.selectedProbes.splice(index, 1)
	    } else {
		this.selectedProbes.push(plabel)
	    }
	    var tempData = {...this.fullData}
	    tempData.data = {}
	    Object.keys(this.fullData.data).map( k => {
		//var probe = k.split(" ")[1]
		var probe = k.split(" ")[3]
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
		let key = k.split(" ")[3]
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
	    //var prindex = 1
	    this.selectedProbes = []
	    let probes = Object.keys(data.data).map( (k, ind)  => {
		let [sens, probe, suid, plabel] = k.split(" ")
		
		if (!Object.keys(indices).includes(probe)) {
		    indices[probe] = plabel//prindex
		    //prindex++
		    //this.selectedProbes.push(probe)
		    this.selectedProbes.push(plabel)
		}
	    })
	    //let sensor_buttons = document.getElementsByClassName("sensorbutton")
	    let btn_array = Array.from(this.$refs['sensorbuttons'].children)
	    if (btn_array) {
		btn_array.forEach( b => {
		    b.classList.remove("greytext")
		})
	    }
	    // sort dict by values
	    let reversed_indices = Object.entries(indices).sort().reduce( (o,[k,v]) => (o[""+v]=""+k,o), {} )
	    let fixed_indices = Object.entries(reversed_indices).sort().reduce( (o,[k,v]) => (o[""+v]=""+k,o), {} )
	    this.probes = fixed_indices
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
	    this.loadingdata = true
	    
	    this.$axios.get(this.$backendhost+'sensortypes')
		.then(request => {
		    this.sensorlimits = request.data
		})
		.catch(request => {
		    console.log(request)
		})

	    
	    this.$axios.get(this.$backendhost+'probes', { params: probeparams })
		.then(request => {
		    this.probesCoords = {}
		    request.data.map( obj => {
			let coords = {}
			coords.x = obj.x
			coords.y = obj.y
			coords.z = obj.z
			coords.row = obj.row
			coords.col = obj.col
			this.probesCoords[obj.uuid] = coords
		    })
		})
		.then( req => {
		    this.$axios.get(this.$backendhost+'data', { params: params })
			.then(request1 => {
			    this.plotData = request1.data.data
			    this.fullData = {...this.plotData}
			    /// Filter data based on previously selected sensors
			    // If we filter data, we should modify the preformatData function to
			    // consider already selected probes 
			    //if (this.selectedProbes) {
				//var tempData = {...this.fullData}
				//tempData.data = {}
				//Object.keys(this.fullData.data).map( k => {
				//    //var probe = k.split(" ")[1]
				//    var probe = k.split(" ")[3]
				//    if (this.selectedProbes.includes(probe)) {
				//	tempData.data[k] = this.fullData.data[k]
				//    }
				//})
				//this.plotData = tempData
			    //}
			    
			    console.log("PLOT DATA", this.plotData)
			    this.preformatData(request1.data.data)
			    this.findMax(request1.data.data)
			    this.loadingdata = false
			}
			     )
			.catch(request => {
			    console.log(request)
			    this.flashWarning("No data found", {timeout: 10000})
			    this.loadingdata = false
			})
		})
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
