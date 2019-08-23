<template>
<div class="mainpage">
  <div class="container">
    <h4><flash-message transition-name="fade"></flash-message></h4>
    <div class="row">
      <div class="col-md-12">
	<button v-for="sensor in sensors" type="button" class="btn btn-outline-secondary ml-2 mt-2" @click="showData(sensor.uuid)">
	  Sensor {{sensor.uuid}}  <span class="badge badge-light">{{sensor.numrecords > 0 ? sensor.numrecords + " records" : ""}}</span>
	</button>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
	<chartjs-line :labels="labels" :bind="true" :datasets="datasets" ></chartjs-line>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
	<form>
	  <div class="form-group">
	    <label for="formControlRange">Captured pictures</label>
	    <input type="range" v-model="pictindex" @change="changePicture" min="0" :max="imgcount-1"  class="form-control-range" id="formControlRange">
	  </div>
	</form>
      </div>
    </div>
    
    <div class="row">
      <div class="col-md-6" v-for="pct in imagesrc">
	<img :src="pct[1]" width="100%"> {{pct[0]}}
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
	    loading: false,
	    sensors: null,
	    sensordata: null,
	    hum0: null,
	    hum1: null,
	    temp0: null,
	    temp1: null,
	    tempA: null,
	    lux: null,
	    plotdata: null,
	    labels: [],
	    dataset: [],
	    datasets: [],
	    pictindex: 0,
	    pictures: [],
	    imagesrc: [],
	    imglabel: null,
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
                            beginAtZero:true,
                        }
                    }]
                }
            }
	    
 	}
    },
    created () {
	this.fetchSensors()
    },
    computed: {
	...mapGetters({ currentUser: 'currentUser'})
    },
    methods: {
	changePicture() {
	    console.log(this.pictindex)
	    
	    let urlpref = "https://plantdata.fermata.tech:5498/api/v1/p/"
	    //let linklist = []
	    this.imagesrc = []
	    this.pictures[this.pictindex].map( p => {
		this.imagesrc.push([p[0], urlpref+p[1]])
	    })
	    //this. imagesrc = urlpref + this.pictures[this.pictindex][1]
	    //this.imglabel = this.pictures[this.pictindex][0][0]

	},
	fetchSensors() {
	    this.$axios.get(this.$backendhost+'sensors')
		.then(request => this.setData('sensors', request))
		.catch(request => console.log(request))

	},
	showData(suuid) {
	    let params = {'params': {'uuid': suuid}}
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
		this.sensordata = request.data
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
		this.imgcount = 0
		this.pictindex = 0
		this.sensordata.map(obj => {
		    //this.temperatures[obj.ts] = obj.lux
		    this.labels.push(obj.ts)
		    this.lux.push(obj.lux)
		    this.hum0.push(obj.hum0)
		    this.hum1.push(obj.hum1)
		    this.temp0.push(obj.temp0)
		    this.temp1.push(obj.temp1)
		    this.tempA.push(obj.tempA)
		    this.co2.push(obj.co2)
		    console.log(obj.pictures)
		    let pictlist = []
		    obj.pictures.map( p => {
			pictlist.push([obj.ts,  p.fpath])
		    })
		    this.pictures.push(pictlist)
		}
				   )
		
		this.imgcount = this.pictures.length
		
		this.datasets.push({label: "LUX",
				    lineTension: 0.1,
				    backgroundColor: "rgba(207, 218, 245,0.2)",
				    borderColor: "rgba(207, 218, 245,1)",
				    borderCapStyle: 'butt',
				    borderDash: [],
				    borderDashOffset: 0.0,
				    borderJoinStyle: 'miter',
				    pointBorderColor: "rgba(207, 218, 245,1)",
				    pointBackgroundColor: "#fff",
				    pointBorderWidth: 1,
				    pointHoverRadius: 5,
				    pointHoverBackgroundColor: "rgba(207, 218, 245,1)",
				    pointHoverBorderColor: "rgba(220,220,220,1)",
				    pointHoverBorderWidth: 2,
				    pointRadius: 1,
				    pointHitRadius: 10,
				    data: this.lux,
				    spanGaps: false
				   })
		this.datasets.push({label: "HUM0",
				    lineTension: 0.1,
				    backgroundColor: "rgba(75,192,192,0.2)",
				    borderColor: "rgba(75,192,192,1)",
				    borderCapStyle: 'butt',
				    borderDash: [],
				    borderDashOffset: 0.0,
				    borderJoinStyle: 'miter',
				    pointBorderColor: "rgba(75,192,192,1)",
				    pointBackgroundColor: "#fff",
				    pointBorderWidth: 1,
				    pointHoverRadius: 5,
				    pointHoverBackgroundColor: "rgba(75,192,192,1)",
				    pointHoverBorderColor: "rgba(220,220,220,1)",
				    pointHoverBorderWidth: 2,
				    pointRadius: 1,
				    pointHitRadius: 10,
				    data: this.hum0,
				    spanGaps: false
				   })
		this.datasets.push({label: "HUM1",
				    lineTension: 0.1,
				    backgroundColor: "rgba(117,233,239,0.2)",
				    borderColor: "rgba(117,233,239 ,1)",
				    borderCapStyle: 'butt',
				    borderDash: [],
				    borderDashOffset: 0.0,
				    borderJoinStyle: 'miter',
				    pointBorderColor: "117,233,239 207,1)",
				    pointBackgroundColor: "#fff",
				    pointBorderWidth: 1,
				    pointHoverRadius: 5,
				    pointHoverBackgroundColor: "rgba(117,233,239,1)",
				    pointHoverBorderColor: "rgba(220,220,220,1)",
				    pointHoverBorderWidth: 2,
				    pointRadius: 1,
				    pointHitRadius: 10,
				    data: this.hum1,
				    spanGaps: false
				   })
		this.datasets.push({label: "TEMP0",
				    lineTension: 0.1,
				    backgroundColor: "rgba(239, 117, 172,0.2)",
				    borderColor: "rgba(239, 117, 172,1)",
				    borderCapStyle: 'butt',
				    borderDash: [],
				    borderDashOffset: 0.0,
				    borderJoinStyle: 'miter',
				    pointBorderColor: "239, 117, 172,1)",
				    pointBackgroundColor: "#fff",
				    pointBorderWidth: 1,
				    pointHoverRadius: 5,
				    pointHoverBackgroundColor: "rgba(239, 117, 172,1)",
				    pointHoverBorderColor: "rgba(220,220,220,1)",
				    pointHoverBorderWidth: 2,
				    pointRadius: 1,
				    pointHitRadius: 10,
				    data: this.temp0,
				    spanGaps: false
				   })
		this.datasets.push({label: "TEMP1",
				    lineTension: 0.1,
				    backgroundColor: "rgba(226, 130, 173,0.2)",
				    borderColor: "rgba(226, 130, 173,1)",
				    borderCapStyle: 'butt',
				    borderDash: [],
				    borderDashOffset: 0.0,
				    borderJoinStyle: 'miter',
				    pointBorderColor: "226, 130, 173,1)",
				    pointBackgroundColor: "#fff",
				    pointBorderWidth: 1,
				    pointHoverRadius: 5,
				    pointHoverBackgroundColor: "rgba(226, 130, 173,1)",
				    pointHoverBorderColor: "rgba(220,220,220,1)",
				    pointHoverBorderWidth: 2,
				    pointRadius: 1,
				    pointHitRadius: 10,
				    data: this.temp1,
				    spanGaps: false
				   })
		this.datasets.push({label: "TEMPA",
				    lineTension: 0.1,
				    backgroundColor: "rgba(226, 132, 179,0.2)",
				    borderColor: "rgba(226, 132, 179,1)",
				    borderCapStyle: 'butt',
				    borderDash: [],
				    borderDashOffset: 0.0,
				    borderJoinStyle: 'miter',
				    pointBorderColor: "226, 132, 179,1)",
				    pointBackgroundColor: "#fff",
				    pointBorderWidth: 1,
				    pointHoverRadius: 5,
				    pointHoverBackgroundColor: "rgba(226, 132, 179,1)",
				    pointHoverBorderColor: "rgba(220,220,220,1)",
				    pointHoverBorderWidth: 2,
				    pointRadius: 1,
				    pointHitRadius: 10,
				    data: this.tempA,
				    spanGaps: false
				   })
		this.datasets.push({label: "CO2",
				    lineTension: 0.1,
				    backgroundColor: "rgba(164, 168, 50, 0.2)",
				    borderColor: "rgba(164, 168, 50,1)",
				    borderCapStyle: 'butt',
				    borderDash: [],
				    borderDashOffset: 0.0,
				    borderJoinStyle: 'miter',
				    pointBorderColor: "164, 168, 50,1)",
				    pointBackgroundColor: "#fff",
				    pointBorderWidth: 1,
				    pointHoverRadius: 5,
				    pointHoverBackgroundColor: "rgba(164, 168, 50,1)",
				    pointHoverBorderColor: "rgba(220,220,220,1)",
				    pointHoverBorderWidth: 2,
				    pointRadius: 1,
				    pointHitRadius: 10,
				    data: this.co2,
				    spanGaps: false
				   })
		
	    }
	    
	}
    }

}
</script>


<style>
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
