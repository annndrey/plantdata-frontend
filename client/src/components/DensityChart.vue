<template>
  
<div id="dens-container" class="svg-dens-container" align="center">
  <span  :class="{greytext: par != selectedSensor}" v-for="(par, ind) in allSensors" :key="par" @click="modifySensorsList(par, $event)"> {{par | fixParameterName}} </span>
  <form v-if="datesIndices">
    <div class="form-group">
      <label for="formControlRange"> Data collection time selector <small>showing data for {{dates[datesIndex]}}</small></label>
      <input type="range" v-model="datesIndex" min="0" :max="datesIndices.length-1" @change="AnimateLoad" class="form-control-range" id="formControlRange">
    </div>
  </form>
  <div class="row">
    <div class="col-md-12">

      <span>Spatial distribution of collected climatic data<span>
    </div>
  </div>
  <div class="row mt-2">
    <div class="col-md-12">
      <svg id="dens-chart" v-if="redrawToggle === true" :width="svgWidth" :height="svgHeight+200">
      </svg>
    </div>
  </div>
  
</div>
</template>

<script>
import { scaleLinear, scalePoint, scaleBand, scaleTime } from "d3-scale";
import { max, min } from "d3-array";
import { select, selectAll } from "d3-selection";
import { transition } from "d3-transition";
import { axisBottom, axisLeft, line, easeLinear } from 'd3';
import moment from 'moment'
//import Spline from 'cubic-spline'
import kriging from '@sakitam-gis/kriging'
var linearInterpolator = require('linear-interpolator')

export default {
    name: "DensityChart",
    props: {
	title: String,
	xKey: String,
	yKey: String,
	data: Array,
	probedata: Array,
	probescoords: Object,
	parmax: Object,
	svgWidth: Number
    },
    filters: {
	fixParameterName: function (value) {
	    let parNum = value.charAt(value.length-1)
	    if (value.startsWith("T")) {
		return "Temp #" + parNum
	    } else if (value.startsWith("C")) {
		return "CO2 #" + parNum
	    } else if (value.startsWith("H")) {
		return "Humid # " + parNum
	    }
	}
    },
    watch: { 
      	data: function(newVal, oldVal) { // watch it
	    this.fillDates()
	    this.fillValues()
	    this.fillSensors()
   	    this.AnimateLoad()
        }
    },
    beforeUpdate() {
	
    },
    data: () => ({
	redrawToggle: true,
	dates: null,
	datesIndices: null,
	datesIndex: 0,
	currentDate: null,
	dataKeys: null,
	dimX: null,
	dimY: null,
	plotData: null,
	origData: null,
	selectedSensor: null,
	allSensors: null,
	localMax: null,
	fulldata: null
    }),
    methods: {
	modifySensorsList(val, event) {
	    event.target.classList.toggle('greytext')
	    this.selectedSensor = val
	    this.AnimateLoad()
	},
	changeDate() {
	    // create plot
	    console.log("Redraw 3D for", this.dates[this.datesIndex])
	    this.plotData = []
	    this.origData = []
	    this.plotMax = 0
	    var dataKeys = Object.keys(this.data.data)
	    var lockey = Object.keys(this.data.locdimensions)[0]
	    
	    this.dimX = this.data.locdimensions[lockey].x
	    this.dimY = this.data.locdimensions[lockey].y

	    // add some initial values
	    var xcoords = [0, this.dimX, this.dimX, 0]
	    var ycoords = [0, this.dimY, 0, this.dimY]
	    var target = [0, 0, 0, 0]
	    var paramKey = this.selectedSensor
	    
	    dataKeys.map(k => {
		var key_splitted = k.split(" ")
		var k_paramKey = key_splitted[0]
		var key = key_splitted[1]
		if ( k_paramKey == paramKey ) {
		    
		    var pld = this.fulldata[paramKey + " " + key + " " + lockey][this.datesIndex]
		    var x = this.probescoords[key].x
		    var y = this.probescoords[key].y
		    
		    target.push(pld)
		    xcoords.push(x)
		    ycoords.push(y)
		    var orig_data = {'x': x, 'y': y, 'val': pld, 'probe': this.probedata[key]}
		    this.origData.push(orig_data)
		}
	    })
	    //var average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length
	    //var realValues = target.slice(4, target.length)
	    
	    //var plotMean = average(realValues)
	    //target.splice(0, 4, plotMean, plotMean, plotMean, plotMean)
	    this.plotMin = 0//min(target)
	    this.plotMax = this.parmax[paramKey]
	    //console.log("MIN MAX", this.plotMin)
	    // Kriging can be replaced with
	    // bspline https://www.npmjs.com/package/b-spline
	    
	    var model = "exponential"
	    var sigma2 = 0, alpha = 100
	    
	    console.log("MODEL", target, xcoords, ycoords, this.origData)
	    
	    var variogram = kriging.train(target, xcoords, ycoords, model, sigma2, alpha)
	    
	    for (var xindex = 0; xindex < this.dimX; xindex++) {
		for (var yindex = 0; yindex < this.dimY; yindex++) {
		    var xnew = xindex
		    var ynew = yindex
		    //console.log("X", xnew, "Y", ynew)
		    var tpredicted = kriging.predict(xnew, ynew, variogram)

		    if (!tpredicted) {
			tpredicted = this.plotMin
		    }
		    if (tpredicted < this.plotMin) {
			tpredicted = this.plotMin
		    }
		    if (tpredicted > this.plotMax) {
			tpredicted = this.plotMax
		    }
		    var pldata = {'x': xnew, 'y': ynew, 'val': tpredicted}
		    //console.log(pldata)
		    this.plotData.push(pldata)
		}
	    }
	    
	    this.localMax = Math.max(...this.plotData.map(d => {return d.val}))

	},
	fillSensors() {
	    this.allSensors = []
	    Object.keys(this.data.data).map( k => {
		let key = k.split(" ")[0]
		if (!this.allSensors.includes(key)) {
		    this.allSensors.push(key)
		}
	    })
	    if (!this.selectedSensor) {
		this.selectedSensor = this.allSensors[0]
	    }
	},
	fillDates() {
	    //
	    this.dates = []
	    this.data.labels.map( d =>{
		let datalabel = moment(d).locale('en').format('HH:mm')
		this.dates.push(datalabel)
	    })
	    this.datesIndices = Array.from({length:this.dates.length},(v,k)=>k)
	},
	fillValues() {
	    this.fulldata = {}
	    Object.keys(this.data.data).map( k => {
		let probekey = k.slice(3)
		let prlabels = this.data.probelabels[probekey]
		let all_probe_values_list = new Array(this.data.labels.length)
		all_probe_values_list.fill(null)
		//console.log("empty all_probe_values_list", all_probe_values_list)
		prlabels.map(pr_label => {
		    let pr_index_full = this.data.labels.indexOf(pr_label)
		    let pr_index_short = this.data.probelabels[probekey].indexOf(pr_label)
		    let pr_value = this.data.data[k][pr_index_short]
		    all_probe_values_list[pr_index_full] =  pr_value
		})

		// TODO: >>> Fill null values somehow
		console.log("empty all_probe_values_list", all_probe_values_list)

		var non_null_values = all_probe_values_list.reduce(function(res, d){
		    if (d != null) {
			res.push([all_probe_values_list.indexOf(d), d])
		    }
		    return res
		}, [])
		console.log("non null values", non_null_values)
		var lin_interp = linearInterpolator(non_null_values)
		var filled_values = all_probe_values_list.map((d,i) => {
		    return lin_interp(i)
		})
		//console.log("filled_values", filled_values)					      
		this.fulldata[k] = filled_values//all_probe_values_list
		// create empty probevalue list of all labels length
		// iterate over prlabels
		// find prlabel index in alllabels
		// insert into probevalue list probe value at index position
		//
	    })
	},
	AnimateLoad() {
	    this.changeDate()
	    select("#dens-chart").selectAll("*").remove()
	    var plotGroups = Array.from({length:this.dimX},(v,k)=>k)
	    var plotVars = Array.from({length:this.dimY},(v,k)=>k)
	    
	    var x = scaleBand()
		.range([ 0, this.svgWidth ])
		.domain(plotGroups)
		//.padding(0.01) // <-- remove rect borders

	    var y = scaleBand()
		.range([ this.svgHeight, 0 ])
		.domain(plotVars)
	    //.padding(0.01)
	    var colors = ["#163a5f", "#45eba5"]
	    var plotColor = scaleLinear()
		.range(colors)
		.domain([this.plotMin, this.plotMax ])
	    
	    var svg = select("#dens-chart")
	    	.attr("width", this.svgWidth)
		.attr("height", this.svgHeight + 200)
	    
	    var densGroup = svg.append("g")
	    	//.attr("transform", "translate(10,0)")
		.attr("class", "densGroup")

	    // add interpolated data
	    densGroup.selectAll()
		.data(this.plotData)
		.enter()
		.append("rect")
		.attr("x", function(d) { return x(d.x) })
		.attr("y", function(d) { return y(d.y) })
		.attr("width", x.bandwidth() )
		.attr("height", y.bandwidth() )
		.style("fill", function(d) { return plotColor(d.val)} )

	    // add original data
	   var orig_circle = densGroup.selectAll()
		.data(this.origData)
		.enter()
		.append("g")

	    orig_circle.append("circle")
		.attr("r", 8)
		.attr("cx", function(d) { return x(d.x) + x.bandwidth()/2})
		.attr("cy", function(d) { return y(d.y) + y.bandwidth()/2 })
		.style("fill", "black" )
		.style("opacity", 0.5)
		.style("stroke", "gray")

	    orig_circle.append("text")
	    	.text(d => {
		    console.log("TEXT", d)
		    return d.probe 
		})
	    	.style("font-size", "10px")
		.style("fill", "#21aba5")
	    	.attr("transform", (d, i) => {
		    let dx = x(d.x) + x.bandwidth() / 3.1
		    let dy = y(d.y) + y.bandwidth() /1.3
		    return "translate(" + dx + "," + dy + ")"
		    
		})

	    orig_circle.append("text")
	    	.text(d => {
		    return d.val.toFixed(2)
		})
	    	.style("font-size", "10px")
		.style("fill", "#fff")
	    	.attr("transform", (d, i) => {
		    let dx = x(d.x) + x.bandwidth() / 0.7
		    let dy = y(d.y) + y.bandwidth() /1.3
		    return "translate(" + dx + "," + dy + ")"
		    
		})
	    var grad = svg.append('defs')
		.append('linearGradient')
		.attr('id', 'grad')
		.attr('x1', '0%')
		.attr('x2', '100%')
		.attr('y1', '0%')
		.attr('y2', '0%');

	    //var colors = ['#e0f7d2', '#fa5061']

	    grad.selectAll('stop')
		.data(colors)
		.enter()
		.append('stop')
		.style('stop-color', function(d){ return d; })
		.attr('offset', function(d,i){
		    return 100 * (i / (colors.length - 1)) + '%';
		})

	    var legend = svg.append('g')
		.attr("class", "sens-legend")
    		.attr("transform", "translate(0,120)")
	    
	    let legend_x = this.svgWidth*0.05
	    let legend_y = this.svgHeight * 0.8 
	    
	    legend.append("rect")
		.attr('x', legend_x+ 10)
		.attr('y', legend_y)
		.attr('width', this.svgWidth*0.8)
		.attr('height', 10)
		.style('fill', 'url(#grad)');

	    legend.append("text")
		.attr("text-anchor", "end")
		.attr("y",  legend_y + 10)
		.attr("x", this.svgWidth*0.995)
		.text(this.plotMax.toFixed(2))
	    
	    legend.append("text")
		.attr("class", "legendText")
		.attr("text-anchor", "end")
		.attr("y",  legend_y + 10)
		.attr("x", this.svgWidth*0.04)
		.text(this.plotMin)


	},
	AddResizeListener() {
	    // redraw the chart 300ms after the window has been resized
	    window.addEventListener("resize", () => {

		setTimeout(() => {
		    this.$data.redrawToggle = true;
		    //this.$data.svgWidth =
		//	document.getElementById("dens-container").offsetWidth * 1;
		    //this.AnimateLoad();
		}, 300);
	    });
	}
    },
    computed: {
	dataMax() {
	    return max(this.data, d => {
		return d[this.yKey];
	    });
	},
	dataMin() {
	    return min(this.data, d => {
		return d[this.yKey];
	    });
	},
	xScale() {
	    return scalePoint()
		.range([this.svgWidth*0.01, this.svgWidth*0.99])
		.domain(
		    this.data.labels.map((obj) => {
			//console.log('scale', moment(obj).locale('en').format('HH:mm'))
			return moment(obj).locale('en').format('HH:mm')
		    })
		)
	},
	yScale() {
	    return scaleLinear() 
		.rangeRound([this.svgHeight, 0])
		.domain([])
	},
	svgHeight() {
	    return this.svgWidth
	}
    }
};
</script>

<style>
  
.green {
    fill: #7fd76b;
}

.svg-dens-container {
    display: inline-block;
    position: relative;
    width: 100%;
    padding-bottom: 1%;
    vertical-align: top;
    overflow: hidden;
}
  .densText {
  fill: white;
  font-size: 1.2em;
  font-weight: bold;
  }
  .densTextSmall {
  fill: #7fd76b;
  font-size: 0.8em;
  font-weight: bold;
  }
  .text-lght {
      opacity: 0.5
  }
  .domain {
      visibility:hidden;
  }
  .axis {
      font-size: 0.5em;
  }
  .line {
      transition: r 0.2s ease-in-out;
  }
  line0 {
      stroke: orange;
  }
  line1 {
      stroke: steelblue;
  }
  line2 {
      stroke: red;
  }
  line3 {
      stroke: purple;
  }
  line4 {
      stroke: cyan;
  }
  line5 {
      stroke: magenta;
  }
  line6 {
      stroke: gray;
  }
  .overlay {
      fill: none;
      pointer-events: all;
  }
  .lineHoverText {
      text-shadow:
      -2px -2px 0 #fff,
      2px -2px 0 #fff,
      -2px 2px 0 #fff,
      2px 2px 0 #fff;
  }
  .hoverCircle {
      opacity: .75;
  }
  .greytext {
      color: lightgray;
  }
      
</style>
