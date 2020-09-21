<template>
<div id="line-container" class="svg-line-container" align="center">
  <svg id="line-chart" v-if="redrawToggle === true" :width="svgWidth" :height="svgHeight+100">
  </svg>
</div>
</template>

<script>
import { scaleLinear, scalePoint, scaleBand, scaleTime } from "d3-scale";
import { max, min } from "d3-array";
import * as d3 from 'd3'
import { select, selectAll } from "d3-selection";
import { transition } from "d3-transition";
import { axisBottom, axisLeft, line, easeLinear, animate} from 'd3';
import moment from 'moment'

export default {
    name: "LineChart",
    props: {
	title: String,
	xKey: String,
	yKey: String,
	data: Array,
	probedata: Array
    },
    watch: { 
      	data: function(newVal, oldVal) { // watch it
	    this.svgWidth = document.getElementById("line-container").offsetWidth
	    this.AnimateLoad()
        }
    },
    mounted() {
	this.svgWidth = document.getElementById("line-container").offsetWidth 
	//this.AddResizeListener();
	//this.AnimateLoad();
    },
    data: () => ({
	svgWidth: 0,
	redrawToggle: true
    }),
    methods: {
	AnimateLoad() {
	    select("#line-chart").selectAll("*").remove()
	    select(".lineGroup").remove()
	    const vm = this
	    var plotdata = []
	    var colors = ['orange', 'steelblue', 'red', 'purple', 'cyan', 'magenta', 'gray']
	    var datakeys = []
	    
	    Object.keys(this.data.data).map( k => {
		var objlist = []
		datakeys.push(k)
		this.data.labels.map((obj, index) => {
		    let label = moment(obj).toDate()
		    let val =  this.data.data[k][index]
		    objlist.push({"date": label, "value": val})
		})
		plotdata.push(objlist)
	    })
	    
	    
	    //let xticks = this.data.labels.map((obj) => {
	//	return  moment(obj).locale('en').format('HH:mm')
	 //   })
	    
	    let xtickstime = this.data.labels.map((obj) => {
		return  moment(obj).toDate()
	    })
	    
	    //if (xticks.length > 30) {
	//	let ratio = Math.ceil(xticks.length / 30)
	///	xticks = xticks.filter(function (value, index, ar) {
	//	    return (index % ratio == 0);
	//	} )
	  //  }
	    
	    const datalists = Object.keys(this.data.data).map((k) => this.data.data[k])
	    const highestAmount = max(datalists.map(d => max(d)))
	    let yticks = Array.from({length:highestAmount},(v,k)=>k)
	    
	    //var x = scalePoint()
		//.domain(xticks)
		//.range([this.svgWidth*0.01, this.svgWidth*0.99])
	    //.range([this.svgWidth*0.040, this.svgWidth*0.97])
	    
	    var xtime = scaleTime()
		.domain([xtickstime[0], xtickstime[xtickstime.length-1]])
		//.domain(d3.extent(...xtickstime))
		.range([this.svgWidth*0.01, this.svgWidth*0.99])
		//.nice()
	    
	    var miny = min(yticks)
	    var maxy = max(yticks)
	    
	    if (miny == null && maxy == null) {
		miny = 0
		maxy = 100
		yticks = Array.from(Array(100).keys())

	    }
	    var y = scaleLinear()
		.domain([miny, maxy])
		.range([this.svgHeight, 0])

	    var svg = select("#line-chart")
	    	.attr("width", this.svgWidth)
		.attr("height", this.svgHeight+100)
	    
	    //svg.append("defs").append("clipPath")
		//.attr("id", "clip")
		//.append("rect")
	    	//.attr("width", this.svgWidth)
		//.attr("height", this.svgHeight*1.2)

    	    var xlabelstime = svg.append("g")
	    	.attr("class", "axisBottom")
	    	.attr("transform", "translate(" + this.svgWidth * 0.01 + "," + this.svgHeight * 1.2 + ")")
		.call(axisBottom(xtime)
		      .ticks(24)
		      .tickFormat(d3.timeFormat("%H:%M"))
		      .tickSize(-this.svgHeight, 0, 0)
		     )
	    
	    xlabelstime.selectAll(".tick line").attr("stroke", "lightgray").attr("stroke-dasharray", "1,4")
	    xlabelstime.selectAll(".tick")
		.each(function (d,i) {
		    select(this)
			.attr("color", function() {
			    if (i % 2 == 0) {
				return "lightgray"
			    } else {
				return "gray"
			    }
			})
		})
	    //yaxis
	    var ylabels = svg.append("g")
		.attr("class", "axisLeft")
	    	.attr("transform", "translate(22," + this.svgHeight * 0.2 +")")
	    	.call(axisLeft(y)
		      .tickSize(-this.svgWidth, 0, 0)
		     )
	    
	    ylabels.selectAll(".tick line").attr("stroke", "lightgray").attr("stroke-dasharray", "1,4")
	    ylabels.selectAll(".tick")
		.each(function (d,i) {
		    select(this)
			.attr("color", function() {
			    if (i % 2 == 0) {
				return "lightgray"
			    } else {
				return "gray"
			    }
			})
		})
	    var clip = svg.append("defs").append("svg:clipPath")
		.attr("id", "clip")
		.append("svg:rect")
		.attr("width", this.svgWidth )
		.attr("height", this.svgHeight )
		.attr("x", this.svgWidth*0.01)
		.attr("y", 0)

	    var lineGroup = svg.append("g")
		.attr("clip-path", "url(#clip)")
		.attr("transform", "translate(" + this.svgWidth*0.01 +  ", " + this.svgHeight * .2 + ")")
		.attr("class", "lineGroup")
		.attr('height', this.svgHeight * 0.8)
	    
	    var l = line()
		.x(d => {
		    return xtime(d.date)
		})
		.y(d =>{
		    return y(d.value)
		})
	    

	    var lines = lineGroup.selectAll(".line")
		.data(plotdata)
		.enter().append("path")
	    	.attr("fill", "none")
		.attr("stroke-width", 1)
		.attr("d", l)
		.attr("class", "line")
		.each(function(d,i) {
		    var ln  = select(this)
		    ln.attr("class", "line line"+i)
			.attr('stroke', colors[i])
			.attr("id", "line"+colors[i])
			.style("opacity", 1)
		    // line animation
		    //let lnLength = ln.node().getTotalLength()
		    
		    //ln.attr("stroke-dasharray", lnLength + " " + lnLength)
			//.attr("stroke-dashoffset", lnLength)
			//.transition()
			//.duration(2800)
			//.ease(easeLinear)
			//.attr("stroke-dashoffset", 0)
		})

	    var textlegend = svg.append("g")
	    	.append("text")
	    	.attr("class", "textlegend")
		.attr("x", "50%")
		.attr("y", "5%")
		.attr("dominant-baseline", "middle")
		.attr("text-anchor", "middle")
		.data(colors)
		.enter()
		.each((d,i) => {
		    var textdata = datakeys[i-1]
		    if (textdata) {
			var text = select(".textlegend")
			var tspan = text.append("tspan")
			let [sens, prb] = textdata.split(" ")
			tspan.text(" " + sens + " Probe #" + this.probedata[prb] + " ")
			tspan.attr('font-size', '0.8em')
			tspan.attr('fill', colors[i-1])
			tspan.attr("id", "text" + colors[i-1])
			//show/hide onclick
			    .on("click", function(){
				var lineid = "#line"+colors[i-1]
				var textid = "#text"+colors[i-1]
				var selectedLine = select(lineid)
				var selectedText = select(textid)
				var lineOpacity = selectedLine.style("opacity") == 0 ? 1 : 0
				var textColor = selectedText.attr("fill") == colors[i-1] ? "lightgrey" : colors[i-1] 
				select(lineid)
				    .transition()
				    .duration(300)
				    .style("opacity", lineOpacity)
				selectedText.attr("fill", textColor)
				// Update whether or not the elements are active
				//selectedLine.active = active
			    })
		    }})
	    var zoom = d3.zoom()
		.scaleExtent([0.5, 20]) 
		.extent([[0, 0], [this.svgWidth, this.svgHeight]])
		.on("zoom", updateChart)
	    
	    var margin = {top: this.svgHeight*0.2, right: 30, bottom: 30, left: 0}
	    
	    // append an invisible rect to svg to catch all pointer events
	    svg.append("rect")
		.attr("width", this.svgWidth)
		.attr("height", this.svgHeight)
		.style("fill", "none")
		.style("pointer-events", "all")
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
		.call(zoom)
	    
	    var svgHeight = this.svgHeight
	    var svgWidth = this.svgWidth
	    
	    function updateChart() {
		var newX = d3.event.transform.rescaleX(xtime);
		var newY = d3.event.transform.rescaleY(y);
		
		// update axes with these new boundaries
		//
		xlabelstime.call(d3.axisBottom(newX)
				 .tickFormat(d3.timeFormat("%H:%M"))
				 .tickSize(-svgHeight, 0, 0)
				)
		xlabelstime.selectAll(".tick line").attr("stroke", "lightgray").attr("stroke-dasharray", "1,4")
		ylabels.call(d3.axisLeft(newY)
			     .tickSize(-svgWidth, 0, 0)
			    )
		ylabels.selectAll(".tick line").attr("stroke", "lightgray").attr("stroke-dasharray", "1,4")
		// update lines position
		var zoomedLine = l
		    .x(function(d) {
			return newX(d.date)
		    })
		    .y(function(d) {
			return newY(d.value)
		    })
		
		svg.selectAll("path.line")
		    .attr("d",  function(d) {return zoomedLine(d)})
	    }
	},
	AddResizeListener() {
	    // redraw the chart 300ms after the window has been resized
	    window.addEventListener("resize", () => {

		setTimeout(() => {
		    this.$data.redrawToggle = true;
		    this.$data.svgWidth =
			document.getElementById("line-container").offsetWidth * 1;
		    this.AnimateLoad();
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
	yScale() {
	    return scaleLinear() 
		.rangeRound([this.svgHeight, 0])
		.domain([])
	},
	svgHeight() {
	    return this.svgWidth *0.2 
	}
    }
};
</script>

<style>
  
.green {
    fill: #7fd76b;
}

.svg-line-container {
    display: inline-block;
    position: relative;
    width: 100%;
    padding-bottom: 1%;
    vertical-align: top;
    overflow: hidden;
}
  .lineText {
  fill: white;
  font-size: 1.2em;
  font-weight: bold;
  }
  .lineTextSmall {
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

      
</style>
