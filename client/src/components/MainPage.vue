<template>
  
<div class="mainpage">
  <div class="container">
    <h4><flash-message transition-name="fade"></flash-message></h4>
    <div class="row">
      <div class="col-md-12">
	<button v-for="sensor in sensors" type="button" class="btn btn-outline-secondary ml-2 mt-2" @click="showData(sensor.uuid)">
	  Sensor {{sensor.id}} <small>{{sensor.mindate|moment_filter}} - {{sensor.maxdate|moment_filter}}</small>  <span class="badge badge-light ml-2 align-middle">{{sensor.numrecords > 0 ? sensor.numrecords + " records" : ""}}</span>
	</button>
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
	  <div class="card" v-for="cam, index in imagesrc">
	    <div class="card-header" :id="'camheader' + index" :key="'cam-' + index">
	      <h2 class="mb-0">
		<button class="btn btn-block" type="button" data-toggle="collapse" :data-target="'#collapse'+index" aria-expanded="true" :aria-controls="'collapse'+index">
		  Camera {{cam.camlabel}}
		</button>
	      </h2>
	    </div>
	    <div :id="'collapse'+index" class="collapse" :aria-labelledby="'camheader'+index" data-parent="#accordionClass">
	      <div class="card-body">
		<div class="row">
		  <div class="col-md-6 mt-3" v-for="pos in cam.positions">
		    <span v-for="pict in pos.pictures" >
		      <a type="button" class="btn btn-secondary btn-sm btn-block  mt-2" :href="pict.fpath" target="_blank">Fullsize</a>
		      {{pos.poslabel}} {{pict.ts | moment_filter}} <img :src="pict.preview" width="100%">
		      {{pict.results}}
		    </span>
		  </div>
		</div>
	      </div>
	    </div>
	  </div>  
	</div>
      </div>
      
      <!--<div class="col-md-6" v-for="pct in imagesrc" >
	<p>
	  <button type="button" class="btn btn-secondary btn-sm btn-block  mt-2" @click.prevent="downloadFullsize(pct.orig)">Fullsize</button>
	</p>
	<p>
	  {{pct.pictdate}} {{pct.label}}
	</p>
      </div>
      -->
    </div>
    <!--
    <div class="row" v-if="sensordata">
      <div class="col-md-12" v-for="cam in camerasrc">
	{{cam.camlabel}}
	<p v-for="pos in cam.positions">
	  {{pos.poslabel}}
	  {{pos.picture}}
	</p>
      </div>
    </div>
    -->
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
	    imglabel: null,
	    currentuuid: null,
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
	},
    },
    methods: {
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
	    let urlpref = "https://plantdata.fermata.tech:5498/api/v1/p/"
	    this.imagesrc = []
	    //console.log(this.pictures)
	    this.imagesrc = this.pictures[this.pictindex]
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
	downloadData() {
	    
	    let params = {'params': {'uuid': this.currentuuid,
				     'datefrom': moment(this.daterange.start).utcOffset("+03:00").format("DD-MM-YYYY"),
				     'dateto': moment(this.daterange.end).utcOffset("+03:00").format("DD-MM-YYYY"),
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
	    let params = {'params': {'uuid': this.currentuuid,
				     'datefrom': moment(curdate.start).utcOffset("+03:00").format("DD-MM-YYYY"),
				     'dateto': moment(curdate.end).utcOffset("+03:00").format("DD-MM-YYYY"),
				     //'fill_date': 1
				    }
			 }
	    this.$axios.get(this.$backendhost+'data', params)
		.then(request => this.setData('data', request))
		.catch(request => console.log(request))
	    
	},
	showData(suuid) {
	    this.currentuuid = suuid
	    console.log(this.currentuuid)
	    
	    let params = {'params':
			  {'uuid': suuid,
			   //'fill_date': 1
			  }
			 }
	    this.$axios.get(this.$backendhost+'data', params)
		.then(request => this.setData('data', request))
		.catch(request => console.log(request))
	},
	setData(what, request) {
	    if (what == "sensors") {
		this.sensors = request.data
	    } else if (what == "image") {
		this.imagesrc = request.data
	    } else if (what == "data") {
		this.labels.splice(0, this.labels.length)
		this.datasets.splice(0, this.datasets.length)
		this.pictures.splice(0, this.pictures.length)
		this.sensordata = request.data.data
		this.mindate = request.data.mindate,
		this.maxdate = request.data.maxdate,
		this.imagesrc = ""
		this.imglabel = ""
		this.lux = []
		this.labels = []
		this.hum0 = []
		this.hum1 = []
		this.temp0 = []
		this.temp1 = []
		this.tempA = []
		this.co2 = []
		this.wght0 = []
		this.wght1 = []
		this.wght2 = []
		this.wght3 = []
		this.wght4 = []
		this.imgcount = 0
		this.pictindex = 0
		this.sensordata.map(obj => {
		    //let correctdate = moment(obj.ts).utcOffset("-00:00").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
		    //this.temperatures[obj.ts] = obj.lux
		    //this.labels.push(correctdate)
		    this.labels.push(obj.ts)
		    this.lux.push(obj.lux)
		    this.hum0.push(obj.hum0)
		    this.hum1.push(obj.hum1)
		    this.temp0.push(obj.temp0)
		    this.temp1.push(obj.temp1)
		    this.tempA.push(obj.tempA)
		    this.co2.push(obj.co2)
		    this.wght0.push(obj.wght0)
		    this.wght1.push(obj.wght1)
		    this.wght2.push(obj.wght2)
		    this.wght3.push(obj.wght3)
		    this.wght4.push(obj.wght4)
		    if (obj.cameras.length > 0) {
			this.pictures.push(obj.cameras)
			//this.cameras.push(obj.cameras)
		    }
		}
				   )
		
		this.imgcount = this.pictures.length
		
		this.datasets.push({label: "LUX",
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
				    data: this.lux,
				    spanGaps: true
				   })
		this.datasets.push({label: "HUM0",
				    lineTension: 0.1,
				    fill: false,
				    backgroundColor: "rgba(75, 192, 192, 0.2)",
				    borderColor: "rgba(75, 192, 192, 0.1)",
				    borderCapStyle: 'butt',
				    borderDash: [],
				    borderDashOffset: 0.0,
				    borderJoinStyle: 'miter',
				    pointBorderColor: "rgba(75, 192, 192, 0.7)",
				    pointBackgroundColor: "rgba(75, 192, 192, 0.7)",
				    pointBorderWidth: 1,
				    pointHoverRadius: 5,
				    pointHoverBackgroundColor: "rgba(75, 192, 192, 0.2)",
				    pointHoverBorderColor: "rgba(75, 192, 192, 0.2)",
				    pointHoverBorderWidth: 2,
				    pointRadius: 1,
				    pointHitRadius: 10,
				    data: this.hum0,
				    spanGaps: false
				   })
		this.datasets.push({label: "HUM1",
				    lineTension: 0.1,
				    fill: false,
				    backgroundColor: "rgba(117, 233, 239, 0.2)",
				    borderColor: "rgba(117, 233, 239, 0.1)",
				    borderCapStyle: 'butt',
				    borderDash: [],
				    borderDashOffset: 0.0,
				    borderJoinStyle: 'miter',
				    pointBorderColor: "rgba(117, 233, 239, 0.7)",
				    pointBackgroundColor: "rgba(117, 233, 239, 0.7)",
				    pointBorderWidth: 1,
				    pointHoverRadius: 5,
				    pointHoverBackgroundColor: "rgba(117, 233, 239, 0.2)",
				    pointHoverBorderColor: "rgba(117, 233, 239, 0.2)",
				    pointHoverBorderWidth: 2,
				    pointRadius: 1,
				    pointHitRadius: 10,
				    data: this.hum1,
				    spanGaps: false
				   })
		this.datasets.push({label: "TEMP0",
				    lineTension: 0.1,
				    fill: false,
				    backgroundColor: "rgba(239, 117, 172, 0.2)",
				    borderColor: "rgba(239, 117, 172, 0.1)",
				    borderCapStyle: 'butt',
				    borderDash: [],
				    borderDashOffset: 0.0,
				    borderJoinStyle: 'miter',
				    pointBorderColor: "rgba(239, 117, 172, 0.7)",
				    pointBackgroundColor: "rgba(239, 117, 172, 0.7)",
				    pointBorderWidth: 1,
				    pointHoverRadius: 5,
				    pointHoverBackgroundColor: "rgba(239, 117, 172, 0.2)",
				    pointHoverBorderColor: "rgba(239, 117, 172, 0.2)",
				    pointHoverBorderWidth: 2,
				    pointRadius: 1,
				    pointHitRadius: 10,
				    data: this.temp0,
				    spanGaps: false
				   })
		this.datasets.push({label: "TEMP1",
				    lineTension: 0.1,
				    fill: false,
				    backgroundColor: "rgba(226, 130, 173, 0.2)",
				    borderColor: "rgba(226, 130, 173, 0.1)",
				    borderCapStyle: 'butt',
				    borderDash: [],
				    borderDashOffset: 0.0,
				    borderJoinStyle: 'miter',
				    pointBorderColor: "rgba(226, 130, 173, 0.7)",
				    pointBackgroundColor: "rgba(226, 130, 173, 0.7)",
				    pointBorderWidth: 1,
				    pointHoverRadius: 5,
				    pointHoverBackgroundColor: "rgba(226, 130, 173, 0.2)",
				    pointHoverBorderColor: "rgba(226, 130, 173, 0.2)",
				    pointHoverBorderWidth: 2,
				    pointRadius: 1,
				    pointHitRadius: 10,
				    data: this.temp1,
				    spanGaps: false
				   })
		this.datasets.push({label: "TEMPA",
				    lineTension: 0.1,
				    fill: false,
				    backgroundColor: "rgba(226, 132, 179, 0.2)",
				    borderColor: "rgba(226, 132, 179, 0.1)",
				    borderCapStyle: 'butt',
				    borderDash: [],
				    borderDashOffset: 0.0,
				    borderJoinStyle: 'miter',
				    pointBorderColor: "rgba(226, 132, 179, 0.7)",
				    pointBackgroundColor: "rgba(226, 132, 179, 0.7)",
				    pointBorderWidth: 1,
				    pointHoverRadius: 5,
				    pointHoverBackgroundColor: "rgba(226, 132, 179, 0.2)",
				    pointHoverBorderColor: "rgba(226, 132, 179, 0.2)",
				    pointHoverBorderWidth: 2,
				    pointRadius: 1,
				    pointHitRadius: 10,
				    data: this.tempA,
				    spanGaps: false
				   })
		this.datasets.push({label: "CO2",
				    lineTension: 0.1,
				    fill: false,
				    backgroundColor: "rgba(164, 168, 50, 0.2)",
				    borderColor: "rgba(164, 168, 50, 0.1)",
				    borderCapStyle: 'butt',
				    borderDash: [],
				    borderDashOffset: 0.0,
				    borderJoinStyle: 'miter',
				    pointBorderColor: "rgba(164, 168, 50, 0.7)",
				    pointBackgroundColor: "rgba(164, 168, 50, 0.7)",
				    pointBorderWidth: 1,
				    pointHoverRadius: 5,
				    pointHoverBackgroundColor: "rgba(164, 168, 50, 0.2)",
				    pointHoverBorderColor: "rgba(164, 168, 50, 0.2)",
				    pointHoverBorderWidth: 2,
				    pointRadius: 1,
				    pointHitRadius: 10,
				    data: this.co2,
				    spanGaps: false
				   })
		this.datasets.push({label: "WGHT0",
				    lineTension: 0.1,
				    fill: false, 
				    backgroundColor: "rgba(181, 34, 226, 0.2)",
				    borderColor: "rgba(181, 34, 226, 0.1)",
				    borderCapStyle: 'butt',
				    borderDash: [],
				    borderDashOffset: 0.0,
				    borderJoinStyle: 'miter',
				    pointBorderColor: "rgba(181, 34, 226, 0.7)",
				    pointBackgroundColor: "rgba(181, 34, 226, 0.7)",
				    pointBorderWidth: 1,
				    pointHoverRadius: 5,
				    pointHoverBackgroundColor: "rgba(181, 34, 226, 0.2)",
				    pointHoverBorderColor: "rgba(181, 34, 226, 0.2)",
				    pointHoverBorderWidth: 2,
				    pointRadius: 1,
				    pointHitRadius: 10,
				    data: this.wght0,
				    spanGaps: false
				   })
		this.datasets.push({label: "WGHT1",
				    lineTension: 0.1,
				    fill: false,
				    backgroundColor: "rgba(204, 153, 0, 0.2)",
				    borderColor: "rgba(204, 153, 0, 0.1)",
				    borderCapStyle: 'butt',
				    borderDash: [],
				    borderDashOffset: 0.0,
				    borderJoinStyle: 'miter',
				    pointBorderColor: "rgba(204, 153, 0, 0.7)",
				    pointBackgroundColor: "rgba(204, 153, 0, 0.7)",
				    pointBorderWidth: 1,
				    pointHoverRadius: 5,
				    pointHoverBackgroundColor: "rgba(204, 153, 0, 0.2)",
				    pointHoverBorderColor: "rgba(204, 153, 0, 0.2)",
				    pointHoverBorderWidth: 2,
				    pointRadius: 1,
				    pointHitRadius: 10,
				    data: this.wght1,
				    spanGaps: false
				   })
		this.datasets.push({label: "WGHT2",
				    lineTension: 0.1,
				    fill: false,
				    backgroundColor: "rgba(204, 102, 0, 0.2)",
				    borderColor: "rgba(204, 102, 0, 0.1)",
				    borderCapStyle: 'butt',
				    borderDash: [],
				    borderDashOffset: 0.0,
				    borderJoinStyle: 'miter',
				    pointBorderColor: "rgba(204, 102, 0, 0.7)",
				    pointBackgroundColor: "rgba(204, 102, 0, 0.7)",
				    pointBorderWidth: 1,
				    pointHoverRadius: 5,
				    pointHoverBackgroundColor: "rgba(204, 102, 0, 0.2)",
				    pointHoverBorderColor: "rgba(204, 102, 0, 0.2)",
				    pointHoverBorderWidth: 2,
				    pointRadius: 1,
				    pointHitRadius: 10,
				    data: this.wght2,
				    spanGaps: false
				   })
		this.datasets.push({label: "WGHT3",
				    lineTension: 0.1,
				    fill: false, 
				    backgroundColor: "rgba(204, 51, 0, 0.2)",
				    borderColor: "rgba(204, 51, 0, 0.1)",
				    borderCapStyle: 'butt',
				    borderDash: [],
				    borderDashOffset: 0.0,
				    borderJoinStyle: 'miter',
				    pointBorderColor: "rgba(204, 51, 0, 0.7)",
				    pointBackgroundColor: "rgba(204, 51, 0, 0.7)",
				    pointBorderWidth: 1,
				    pointHoverRadius: 5,
				    pointHoverBackgroundColor: "rgba(204, 51, 0, 0.2)",
				    pointHoverBorderColor: "rgba(220, 220, 220, 0.2)",
				    pointHoverBorderWidth: 2,
				    pointRadius: 1,
				    pointHitRadius: 10,
				    data: this.wght3,
				    spanGaps: false
				   })
		this.datasets.push({label: "WGHT4",
				    lineTension: 0.1,
				    fill: false, 
				    backgroundColor: "rgba(204, 0, 0, 0.2)",
				    borderColor: "rgba(204, 0, 0, 0.1)",
				    borderCapStyle: 'butt',
				    borderDash: [],
				    borderDashOffset: 0.0,
				    borderJoinStyle: 'miter',
				    pointBorderColor: "rgba(204, 0, 0, 0.7)",
				    pointBackgroundColor: "rgba(204, 0, 0, 0.7",
				    pointBorderWidth: 1,
				    pointHoverRadius: 5,
				    pointHoverBackgroundColor: "rgba(204, 0, 0, 0.2)",
				    pointHoverBorderColor: "rgba(204, 0, 0, 0.2)",
				    pointHoverBorderWidth: 1,
				    pointRadius: 1,
				    pointHitRadius: 10,
				    data: this.wght4,
				    spanGaps: false
				   })

		
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
