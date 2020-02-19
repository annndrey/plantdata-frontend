<template>
  
<div class="mainpage">
  <div class="container">
    <h4><flash-message transition-name="fade"></flash-message></h4>
    <div class="row">
      <div class="col-md-12">
	<div class="row">
	  <div class="col-md-12">
	    <button v-for="sensor in sensors" type="button" class="btn btn-outline-secondary ml-2 mt-2" @click="showData(sensor.uuid)">
	      Sensor Complex {{sensor.id}} <small>{{sensor.mindate|moment_filter}} - {{sensor.maxdate|moment_filter}}</small>  <span class="badge badge-light ml-2 align-middle">{{sensor.numrecords > 0 ? sensor.numrecords + " records" : ""}}</span>
	    </button>
	  </div>
	</div>
	<div class="row">
	  <div class="col-md-12">
	    <button v-for="probe in probes" type="button" class="btn btn-outline-secondary btn-sm ml-2 mt-2" @click="showProbeData(probe.uuid)">
	      <small>probe {{probe.uuid}}</small>
	    </button>
	  </div>
	</div>
      </div>
    </div>
    <div class="row mt-2" v-if="sensordata">
      <div class="col-md-9">
	<chartjs-line :option="plot_options" :labels="labels" :bind="true" :datasets="datasets" ></chartjs-line>
      </div>
      <div class="col-md-3">
	<v-date-picker
	  mode="range"
	  style=".vc-container { background-color: '#2c3e50' !important;}"
	  v-model="daterange"
	  :min-date="mindate"
	  :max-date="maxdate"
	  color='gray'
	  locale="en"
	  firstDayOfWeek="2"
	  is-inline
	  />
	<button type="button" class="btn btn-secondary btn-lg btn-block mt-2" @click="downloadData()">Download data</button>
      </div>
    </div>
    <div class="row" v-if="sensordata">
      <div class="col-md-12">
	<form>
	  <div class="form-group">
	    <label for="formControlRange">Captured pictures ({{imgcount}})</label>
	    <input type="range" v-model="pictindex" @change="changePicture" min="0" :max="imgcount-1"  class="form-control-range" id="formControlRange">
	  </div>
	</form>
      </div>
    </div>

    <div class="row" v-if="sensordata">
      <div class="col-md-12">
	<div class="accordion" id="accordionClass">
	  <div class="card" v-for="cam, index in _.orderBy(imagesrc, 'camlabel')">
	    <div class="card-header" :id="'camheader' + index" :key="'cam-' + index">
	      <h2 class="mb-0">
		<button class="btn btn-block" type="button" data-toggle="collapse" :data-target="'#collapse'+index" aria-expanded="true" :aria-controls="'collapse'+index" @click="fetchCameraData(cam, index, 'N')">
		  Camera {{cam.camlabel}}
		</button>
	      </h2>
	    </div>
	    <div :id="'collapse'+index" class="collapse" :aria-labelledby="'camheader'+index" data-parent="#accordionClass">
	      <div class="card-body">
		<div class="row" v-if="camera">
		  <div class="col-md-6 mt-3" v-for="pos in _.orderBy(camera.positions, 'poslabel')">
		    <p v-for="pict in pos.pictures" >
		      <a type="button" class="btn btn-secondary btn-sm btn-block  mt-2" :href="pict.fpath" target="_blank">Fullsize</a>
		      {{pos.poslabel}} {{pict.ts | moment_filter}} <img :src="pict.preview" width="100%">
		      {{pict.results}}
		    </p>
		  </div>
		</div>
	      </div>
	    </div>
	  </div>  
	</div>
      </div>
    </div>
    <p v-if="loading"><img class="loading" src="@/assets/crone.png" height="40px"></p>
  </div>
</div>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
export default {
    name: 'MainPage',
    data: function() {
	return {
	    trackcoords: false,
	    loading: false,
	    sensors: null,
	    sensordata: null,
	    daterange: {'start': new Date(), 'end': new Date()},
	    currentdate: null,
	    mindate: null,
	    maxdate: null,
	    hum0: null,
	    hum1: null,
	    temp0: null,
	    temp1: null,
	    tempA: null,
	    lux: null,
	    whgt0: null,
	    plotdata: null,
	    plot_options: {
		responsive: true,
		showLines: true,
		tooltips: {
		    enabled: true,
		    callbacks: {
			title: function(tooltipItem, data) {
			    var title = moment(tooltipItem[0].label).utcOffset("+00:00").format("DD-MM-YY HH:mm")
			    return title
			}
		    }
		},
		title:{
                    display: true,
                    text:'Sensors data'
		},
		scales: {
		    xAxes: [{
			type: 'time',
			ticks: {
			    autoSkip: true,
			    maxTicksLimit: 30,
			    callback: function(value, index, values) {
				let newdate = moment(value, 'DD/MM/YYYY HH:mm').utcOffset("+00:00").format("DD/MM/YY HH:mm")
				return newdate
			    }
			},
			time: {
			    unit: 'minute',
			    unitStepSize: 30,
			    displayFormats: {
				minute: 'DD/MM/YY HH:mm'
			    }
			},
			display: true
		    }],
		    yAxes: [{
			display: true,
			scaleLabel: {
			    display: true,
			    labelString: 'Value'
			}
		    }]
		},
	    },
	    labels: [],
	    dataset: [],
	    datasets: [],
	    pictindex: 0,
	    pictures: [],
	    imagesrc: [],
	    probes: [],
	    camindex: null,
	    camera: null,
	    imglabOel: null,
	    currentsuuid: null,
	    currentpuuid: null,
	    customoptions: {
                responsive:true,
                maintainAspectRatio:true,
                title: {
                    display: true,
                    position: 'bottom',
                    text: 'Sensors Data'
                },
                scales: {
                    yAxes: [{
                        display: true,
                        ticks: {
                            beginAtZero: true,
                        }
                    }]
                }
            },
 	}
    },
    created () {
	this.fetchSensors()
    },
    computed: {
	...mapGetters({ currentUser: 'currentUser'})
    },
    watch: {
	'daterange': function(val, oldval) {
	    this.showDataByDate(val)
   	}
    },
    filters: {
	moment_filter: function(date) {
	    let newdate = moment(date).utcOffset("+00:00").format("DD-MM-YYYY HH:mm")
	    return newdate
	}
    },
    methods: {
	fetchCameraData(cam, ind, force) {
	    if ( ind != this.camindex ) {
		this.camindex = ind
		//console.log('Fetch camera data', cam.id, ind, force)
		this.$axios.get(this.$backendhost+'cameras/'+cam.id)
		    .then(request => this.setData('camera', request))
		    .catch(request => console.log(request))
	    } else if (force == 'F') {
		//console.log('Fetch camera data', cam.id, ind, force)
		this.$axios.get(this.$backendhost+'cameras/'+cam.id)
		    .then(request => this.setData('camera', request))
		    .catch(request => console.log(request))
	    }
	    
	},
	downloadFullsize(url) {
	    this.$axios.get(url, { responseType: 'blob' })
		.then(({ data }) => {
		    const blob = new Blob([data], { type: 'image/jpeg' })
		    let link = document.createElement('a')
		    let fname = url.split("/").pop()
		    link.href = window.URL.createObjectURL(blob)
		    link.download = fname
		    link.click()
		})
		.catch(error => console.error(error))
	},
	mouseEnter(event) {
	    this.trackcoords = true
	    console.log("start coords tracking")
	    this.$el.addEventListener('mousemove', this.mouseMove, false)
        },
        mouseLeave(event) {
	    console.log("stop coords tracking")
	    this.trackcoords = false;
        },
        mouseMove(event) {
	    if (this.trackcoords) {
		console.log("x: " + event.offsetX, "y: " + event.offsetY)
	    }
        },
	changePicture() {
	    let urlpref = this.$backendhost + "p/"
	    this.imagesrc = []
	    //console.log(this.pictures)
	    this.imagesrc = this.pictures[this.pictindex]
	    //if (this.camindex) {
	    if (this.camindex !== null) {
		console.log('Fetch from changePicture', this.camindex)
		let cam = this.imagesrc[this.camindex]
		this.fetchCameraData(cam, this.camindex, 'F')
	    }
	    //}
	    //.map( p => {
	    //let correctdate = moment(p[0]).utcOffset("+00:00").format("DD-MM-YY HH:mm")
	    //this.imagesrc.push({"pictdate": correctdate, "url": urlpref+p[1], "orig": urlpref+p[3], "label": decodeURI(p[2])})
	    //})
	    //this.imagesrc.sort((a,b) => (a.label > b.label) ? 1 : -1) 
	    // cameras
	    //this.camerasrc = []
	    //this.camerasrc = this.cameras[this.pictindex]
	    
	    
	},
	fetchSensors() {
	    this.$axios.get(this.$backendhost+'sensors')
		.then(request => this.setData('sensors', request))
		.catch(request => console.log(request))
	    
	},
	getSensorProbes() {
	    let params = {'params': {'suuid': this.currentsuuid}}
	    this.$axios.get(this.$backendhost+'probes', params)
		.then(request => this.setData('probes', request))
		.catch(request => console.log(request))
	    
	},
	downloadData() {
	    
	    let params = {'params': {'suuid': this.currentsuuid,
				     'ts_from': moment(this.daterange.start).utcOffset("+03:00").format("DD-MM-YYYY HH:mm"),
				     'ts_to': moment(this.daterange.end).utcOffset("+03:00").add(23, 'hours').add(59, 'minutes').add(59, 'seconds').format("DD-MM-YYYY HH:mm"),
				     'export': 1,
				     //'fill_date': 1
				    },
			  responseType: 'blob'
			 }
	    this.$axios.get(this.$backendhost+'data', params)
		.then( response => {
		    let blob = new Blob([response], { type: 'text/csv' })
		    const url = window.URL.createObjectURL(new Blob([response.data]))
		    const link = document.createElement('a')
		    link.href = url
		    link.setAttribute('download', 'data.csv')
		    document.body.appendChild(link)
		    link.click()
		    link.removeAttribute("href")
		})
	},
	showDataByDate(curdate) {
	    let params = {'params': {'suuid': this.currentsuuid,
				     'ts_from': moment(curdate.start).utcOffset("+03:00").format("DD-MM-YYYY HH:mm"),
				     'ts_to': moment(this.daterange.end).utcOffset("+03:00").add(23, 'hours').add(59, 'minutes').add(59, 'seconds').format("DD-MM-YYYY HH:mm"),
				     //'fill_date': 1
				    }
			 }
	    console.log(params)
	    this.currentdate = this.daterange
	    this.$axios.get(this.$backendhost+'data', params)
		.then(request => this.setData('data', request))
		.catch(request => console.log(request))
	    
	},
	showData(suuid) {
	    this.currentsuuid = suuid
	    console.log(this.currentsuuid)
	    this.getSensorProbes()
	    let params = {'params':
			  {'suuid': suuid,
			  }
			 }
	    if (this.currentdate) {
		params['params']['ts_from'] =  moment(this.currentdate.start).utcOffset("+03:00").format("DD-MM-YYYY HH:mm")
		params['params']['ts_to'] = moment(this.currentdate.end).utcOffset("+03:00").add(23, 'hours').add(59, 'minutes').add(59, 'seconds').format("DD-MM-YYYY HH:mm")
	    }
	    
	    this.$axios.get(this.$backendhost+'data', params)
		.then(request => this.setData('data', request))
		.catch(request => console.log(request))
	},
	showProbeData(puuid) {
	    this.currentpuuid = puuid
	    if ( this.currentsuuid ) {
		console.log(this.currentpuuid)
		let params = {'params':
			      {'suuid': this.currentsuuid,
			       'puuid': puuid
			      }
			     }
		if (this.daterange) {
		    params['params']['ts_from'] =  moment(this.daterange.start).utcOffset("+03:00").format("DD-MM-YYYY HH:mm")
		    params['params']['ts_to'] = moment(this.daterange.end).utcOffset("+03:00").add(23, 'hours').add(59, 'minutes').add(59, 'seconds').format("DD-MM-YYYY HH:mm")
		}
		this.$axios.get(this.$backendhost+'data', params)
		    .then(request => this.setData('data', request))
		    .catch(request => console.log(request))
	    }
	},
	setData(what, request) {
	    if (what == "sensors") {
		this.sensors = request.data
	    } else if (what == "image") {
		this.imagesrc = request.data
	    } else if (what == "camera") {
		this.camera = request.data
	    } else if (what == "probes") {
		this.probes = request.data
	    } else if (what == "data") {
		this.labels.splice(0, this.labels.length)
		this.datasets.splice(0, this.datasets.length)
		this.pictures.splice(0, this.pictures.length)

		this.sensordata = request.data.data
		this.mindate = request.data.mindate
		this.maxdate = request.data.maxdate
		this.imagesrc = ""
		this.imglabel = ""
		this.lux = []
		this.labels = []
		this.imgcount = 0
		this.pictindex = 0
		this.probedata = {}
		
		this.sensordata.map(obj => {
		    obj.probes.map( probe => {
			probe.values.map ( val => {
			    let datalabel = probe.uuid + ' ' + val.label
				if (this.probedata[datalabel]) {
				    this.probedata[datalabel].values.push(val.value)
				} else {
				    var datavalues = new Object()
				    datavalues.label = datalabel
				    datavalues.values = []
				    this.probedata[datalabel] = datavalues
				    this.probedata[datalabel].values.push(val.value)
				}
			    }
					     )
		    }
				  )

		    this.labels.push(obj.ts)
		    if (obj.cameras.length > 0) {
			this.pictures.push(obj.cameras)
		    }
		}
				   )
		//console.log(Object.keys(this.probedata))
		console.log(this.labels)
		for (let key in this.probedata) {
		    console.log(this.probedata[key].values.length)
		    this.datasets.push({label: key,
					fill: false,
					lineTension: 0.1,
					backgroundColor: "rgba(207, 218, 245, 0.3)",
					borderColor: "rgba(207, 218, 245, 0.3)",
					borderCapStyle: 'butt',
					borderDash: [],
					borderDashOffset: 0.0,
					borderJoinStyle: 'miter',
					pointBorderColor: "rgba(207, 218, 245, 0.7)",
					pointBackgroundColor: "rgba(207, 218, 245, 0.7)",
					pointBorderWidth: 1,
					pointHoverRadius: 5,
					pointHoverBackgroundColor: "rgba(207, 218, 245, 0.6)",
					pointHoverBorderColor: "rgba(207, 218, 245, 0.6)",
					pointHoverBorderWidth: 2,
					pointRadius: 1,
					pointHitRadius: 10,
					data: this.probedata[key].values,
					spanGaps: true
				       })
		}
		
		this.imgcount = this.pictures.length
		
		
		//this.datasets.push({label: "LUX",
		//		    fill: false,
		//		    lineTension: 0.1,
		//		    backgroundColor: "rgba(207, 218, 245, 0.3)",
		//		    borderColor: "rgba(207, 218, 245, 0.3)",
		//		    borderCapStyle: 'butt',
		//		    borderDash: [],
		//		    borderDashOffset: 0.0,
		//		    borderJoinStyle: 'miter',
		//		    pointBorderColor: "rgba(207, 218, 245, 0.7)",
		//		    pointBackgroundColor: "rgba(207, 218, 245, 0.7)",
		//		    pointBorderWidth: 1,
		//		    pointHoverRadius: 5,
		//		    pointHoverBackgroundColor: "rgba(207, 218, 245, 0.6)",
		//		    pointHoverBorderColor: "rgba(207, 218, 245, 0.6)",
		//		    pointHoverBorderWidth: 2,
		//		    pointRadius: 1,
		//		    pointHitRadius: 10,
		//		    data: this.datavalues.values,
		//		    spanGaps: true
		//		   })
		//
		//this.datasets.push({label: "HUM0",
		//		    lineTension: 0.1,
		//		    fill: false,
		//		    backgroundColor: "rgba(75, 192, 192, 0.2)",
		//		    borderColor: "rgba(75, 192, 192, 0.1)",
		//		    borderCapStyle: 'butt',
		//		    borderDash: [],
		//		    borderDashOffset: 0.0,
		//		    borderJoinStyle: 'miter',
		//		    pointBorderColor: "rgba(75, 192, 192, 0.7)",
		//		    pointBackgroundColor: "rgba(75, 192, 192, 0.7)",
		//		    pointBorderWidth: 1,
		//		    pointHoverRadius: 5,
		//		    pointHoverBackgroundColor: "rgba(75, 192, 192, 0.2)",
		//		    pointHoverBorderColor: "rgba(75, 192, 192, 0.2)",
		//		    pointHoverBorderWidth: 2,
		//		    pointRadius: 1,
		//		    pointHitRadius: 10,
		//		    data: this.hum0,
		//		    spanGaps: false
		//		   })
		//this.datasets.push({label: "HUM1",
		//		    lineTension: 0.1,
		//		    fill: false,
		//		    backgroundColor: "rgba(117, 233, 239, 0.2)",
		//		    borderColor: "rgba(117, 233, 239, 0.1)",
		//		    borderCapStyle: 'butt',
		//		    borderDash: [],
		//		    borderDashOffset: 0.0,
		//		    borderJoinStyle: 'miter',
		//		    pointBorderColor: "rgba(117, 233, 239, 0.7)",
		//		    pointBackgroundColor: "rgba(117, 233, 239, 0.7)",
		//		    pointBorderWidth: 1,
		//		    pointHoverRadius: 5,
		//		    pointHoverBackgroundColor: "rgba(117, 233, 239, 0.2)",
		//		    pointHoverBorderColor: "rgba(117, 233, 239, 0.2)",
		//		    pointHoverBorderWidth: 2,
		//		    pointRadius: 1,
		//		    pointHitRadius: 10,
		//		    data: this.hum1,
		//		    spanGaps: false
		//		   })
		//this.datasets.push({label: "TEMP0",
		//		    lineTension: 0.1,
		//		    fill: false,
		//		    backgroundColor: "rgba(239, 117, 172, 0.2)",
		//		    borderColor: "rgba(239, 117, 172, 0.1)",
		//		    borderCapStyle: 'butt',
		//		    borderDash: [],
		//		    borderDashOffset: 0.0,
		//		    borderJoinStyle: 'miter',
		//		    pointBorderColor: "rgba(239, 117, 172, 0.7)",
		//		    pointBackgroundColor: "rgba(239, 117, 172, 0.7)",
		//		    pointBorderWidth: 1,
		//		    pointHoverRadius: 5,
		//		    pointHoverBackgroundColor: "rgba(239, 117, 172, 0.2)",
		//		    pointHoverBorderColor: "rgba(239, 117, 172, 0.2)",
		//		    pointHoverBorderWidth: 2,
		//		    pointRadius: 1,
		//		    pointHitRadius: 10,
		//		    data: this.temp0,
		//		    spanGaps: false
		//		   })
		//this.datasets.push({label: "TEMP1",
		//		    lineTension: 0.1,
		//		    fill: false,
		//		    backgroundColor: "rgba(226, 130, 173, 0.2)",
		//		    borderColor: "rgba(226, 130, 173, 0.1)",
		//		    borderCapStyle: 'butt',
		//		    borderDash: [],
		//		    borderDashOffset: 0.0,
		//		    borderJoinStyle: 'miter',
		//		    pointBorderColor: "rgba(226, 130, 173, 0.7)",
		//		    pointBackgroundColor: "rgba(226, 130, 173, 0.7)",
		//		    pointBorderWidth: 1,
		//		    pointHoverRadius: 5,
		//		    pointHoverBackgroundColor: "rgba(226, 130, 173, 0.2)",
		//		    pointHoverBorderColor: "rgba(226, 130, 173, 0.2)",
		//		    pointHoverBorderWidth: 2,
		//		    pointRadius: 1,
		//		    pointHitRadius: 10,
		//		    data: this.temp1,
		//		    spanGaps: false
		//		   })
		//this.datasets.push({label: "TEMPA",
		//		    lineTension: 0.1,
		//		    fill: false,
		//		    backgroundColor: "rgba(226, 132, 179, 0.2)",
		//		    borderColor: "rgba(226, 132, 179, 0.1)",
		//		    borderCapStyle: 'butt',
		//		    borderDash: [],
		//		    borderDashOffset: 0.0,
		//		    borderJoinStyle: 'miter',
		//		    pointBorderColor: "rgba(226, 132, 179, 0.7)",
		//		    pointBackgroundColor: "rgba(226, 132, 179, 0.7)",
		//		    pointBorderWidth: 1,
		//		    pointHoverRadius: 5,
		//		    pointHoverBackgroundColor: "rgba(226, 132, 179, 0.2)",
		//		    pointHoverBorderColor: "rgba(226, 132, 179, 0.2)",
		//		    pointHoverBorderWidth: 2,
		//		    pointRadius: 1,
		//		    pointHitRadius: 10,
		//		    data: this.tempA,
		//		    spanGaps: false
		//		   })
		//this.datasets.push({label: "CO2",
		//		    lineTension: 0.1,
		//		    fill: false,
		//		    backgroundColor: "rgba(164, 168, 50, 0.2)",
		//		    borderColor: "rgba(164, 168, 50, 0.1)",
		//		    borderCapStyle: 'butt',
		//		    borderDash: [],
		//		    borderDashOffset: 0.0,
		//		    borderJoinStyle: 'miter',
		//		    pointBorderColor: "rgba(164, 168, 50, 0.7)",
		//		    pointBackgroundColor: "rgba(164, 168, 50, 0.7)",
		//		    pointBorderWidth: 1,
		//		    pointHoverRadius: 5,
		//		    pointHoverBackgroundColor: "rgba(164, 168, 50, 0.2)",
		//		    pointHoverBorderColor: "rgba(164, 168, 50, 0.2)",
		//		    pointHoverBorderWidth: 2,
		//		    pointRadius: 1,
		//		    pointHitRadius: 10,
		//		    data: this.co2,
		//		    spanGaps: false
		//		   })
		//this.datasets.push({label: "WGHT0",
		//		    lineTension: 0.1,
		//		    fill: false, 
		//		    backgroundColor: "rgba(181, 34, 226, 0.2)",
		//		    borderColor: "rgba(181, 34, 226, 0.1)",
		//		    borderCapStyle: 'butt',
		//		    borderDash: [],
		//		    borderDashOffset: 0.0,
		//		    borderJoinStyle: 'miter',
		//		    pointBorderColor: "rgba(181, 34, 226, 0.7)",
		//		    pointBackgroundColor: "rgba(181, 34, 226, 0.7)",
		//		    pointBorderWidth: 1,
		//		    pointHoverRadius: 5,
		//		    pointHoverBackgroundColor: "rgba(181, 34, 226, 0.2)",
		//		    pointHoverBorderColor: "rgba(181, 34, 226, 0.2)",
		//		    pointHoverBorderWidth: 2,
		//		    pointRadius: 1,
		//		    pointHitRadius: 10,
		//		    data: this.wght0,
		//		    spanGaps: false
		//		   })
		//this.datasets.push({label: "WGHT1",
		//		    lineTension: 0.1,
		//		    fill: false,
		//		    backgroundColor: "rgba(204, 153, 0, 0.2)",
		//		    borderColor: "rgba(204, 153, 0, 0.1)",
		//		    borderCapStyle: 'butt',
		//		    borderDash: [],
		//		    borderDashOffset: 0.0,
		//		    borderJoinStyle: 'miter',
		//		    pointBorderColor: "rgba(204, 153, 0, 0.7)",
		//		    pointBackgroundColor: "rgba(204, 153, 0, 0.7)",
		//		    pointBorderWidth: 1,
		//		    pointHoverRadius: 5,
		//		    pointHoverBackgroundColor: "rgba(204, 153, 0, 0.2)",
		//		    pointHoverBorderColor: "rgba(204, 153, 0, 0.2)",
		//		    pointHoverBorderWidth: 2,
		//		    pointRadius: 1,
		//		    pointHitRadius: 10,
		//		    data: this.wght1,
		//		    spanGaps: false
		//		   })
		//this.datasets.push({label: "WGHT2",
		//		    lineTension: 0.1,
		//		    fill: false,
		//		    backgroundColor: "rgba(204, 102, 0, 0.2)",
		//		    borderColor: "rgba(204, 102, 0, 0.1)",
		//		    borderCapStyle: 'butt',
		//		    borderDash: [],
		//		    borderDashOffset: 0.0,
		//		    borderJoinStyle: 'miter',
		//		    pointBorderColor: "rgba(204, 102, 0, 0.7)",
		//		    pointBackgroundColor: "rgba(204, 102, 0, 0.7)",
		//		    pointBorderWidth: 1,
		//		    pointHoverRadius: 5,
		//		    pointHoverBackgroundColor: "rgba(204, 102, 0, 0.2)",
		//		    pointHoverBorderColor: "rgba(204, 102, 0, 0.2)",
		//		    pointHoverBorderWidth: 2,
		//		    pointRadius: 1,
		//		    pointHitRadius: 10,
		//		    data: this.wght2,
		//		    spanGaps: false
		//		   })
		//this.datasets.push({label: "WGHT3",
		//		    lineTension: 0.1,
		//		    fill: false, 
		//		    backgroundColor: "rgba(204, 51, 0, 0.2)",
		//		    borderColor: "rgba(204, 51, 0, 0.1)",
		//		    borderCapStyle: 'butt',
		//		    borderDash: [],
		//		    borderDashOffset: 0.0,
		//		    borderJoinStyle: 'miter',
		//		    pointBorderColor: "rgba(204, 51, 0, 0.7)",
		//		    pointBackgroundColor: "rgba(204, 51, 0, 0.7)",
		//		    pointBorderWidth: 1,
		//		    pointHoverRadius: 5,
		//		    pointHoverBackgroundColor: "rgba(204, 51, 0, 0.2)",
		//		    pointHoverBorderColor: "rgba(220, 220, 220, 0.2)",
		//		    pointHoverBorderWidth: 2,
		//		    pointRadius: 1,
		//		    pointHitRadius: 10,
		//		    data: this.wght3,
		//		    spanGaps: false
		//		   })
		//this.datasets.push({label: "WGHT4",
		//		    lineTension: 0.1,
		//		    fill: false, 
		//		    backgroundColor: "rgba(204, 0, 0, 0.2)",
		//		    borderColor: "rgba(204, 0, 0, 0.1)",
		//		    borderCapStyle: 'butt',
		//		    borderDash: [],
		//		    borderDashOffset: 0.0,
		//		    borderJoinStyle: 'miter',
		//		    pointBorderColor: "rgba(204, 0, 0, 0.7)",
		//		    pointBackgroundColor: "rgba(204, 0, 0, 0.7",
		//		    pointBorderWidth: 1,
		//		    pointHoverRadius: 5,
		//		    pointHoverBackgroundColor: "rgba(204, 0, 0, 0.2)",
		//		    pointHoverBorderColor: "rgba(204, 0, 0, 0.2)",
		//		    pointHoverBorderWidth: 1,
		//		    pointRadius: 1,
		//		    pointHitRadius: 10,
		//		    data: this.wght4,
		//		    spanGaps: false
		//		   })

		
	    }
	    
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
  ul {
  list-style-type: none;
  padding: 0;
  }
  li {
  display: inline-block;
  margin: 0 10px;
  }
  a {
  color: #42b983;
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
  @-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } }
  @-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }
  @keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }
  
</style>
