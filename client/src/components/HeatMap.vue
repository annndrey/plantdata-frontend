<template>
<div id="heatmap-container" class="svg-heatmap-container mt-4" align="center">
  <svg id="heatmap-chart" v-if="redrawToggle === true" :width="svgWidth+100" :height="svgHeight+100">
  </svg>
</div>
</template>

<script>
import { scaleLinear, scaleBand } from "d3-scale";
import { max, min, extent } from "d3-array";
import { select, selectAll } from "d3-selection";
import { transition } from "d3-transition";
import moment from 'moment'

export default {
    name: "HeatMap",
    props: {
	title: String,
	xKey: String,
	yKey: String,
	data: Array,
	dimX: Number,
	dimY: Number
    },
    watch: { 
      	data: function(newVal, oldVal) { 
	    //this.svgWidth = document.getElementById("heatmap-container").offsetWidth/2 + 100
	    this.drawPlot()
        }
    },
    mounted() {
	this.svgWidth = document.getElementById("heatmap-container").offsetWidth/2
	//console.log("heatmap", this.data)
	this.drawPlot()
    },
    data: () => ({
	svgWidth: 0,
	redrawToggle: true
    }),
    methods: {
	drawPlot() {
	    select("#heatmap-chart").selectAll("*").remove()
	    select(".heatmapGroup").remove()
	    
	    var colors = ['#e0f7d2', '#fa5061']
	    var colorDomain = extent(this.data, function(d){
		return d.numwarnings
	    })
	    
	    var plotGroups = Array.from({length:this.dimX},(v,k)=>k)
	    var plotVars = Array.from({length:this.dimY},(v,k)=>k)
	    
	    var plotValues = []
	    // fill the greenhouse area 
	    plotGroups.forEach(function (pg, pi) {
		plotVars.forEach(function (pv, vi) {
		    var crd = {"x": pg, "y":pv}
		    plotValues.push(crd)
		})
	    })
		
	    var x = scaleBand()
		.range([ 0, this.svgWidth ])
		.domain(plotGroups)
	    .padding(0.01) // <-- remove rect borders

	    var y = scaleBand()
		.range([ this.svgHeight, 0 ])
		.domain(plotVars)
	    .padding(0.01)
	    
	    var colorScale = scaleLinear()
		.domain(colorDomain)
		.range(colors)
	    
	    var add_width = this.svgWidth + 100
	    var add_height = this.svgWidth + 100
	    var svg = select("#heatmap-chart")
	    	.attr("width", add_width)
		.attr("height", add_height)
		.append("g")
		.attr("class", "heatmapGroup")
	    //.attr("transform", "translate(" + this.svgWidth*0.35 + ",0)")
	    
	    // legend

	    var grad = svg.append('defs')
		.append('linearGradient')
		.attr('id', 'grad')
		.attr('x1', '0%')
		.attr('x2', '100%')
		.attr('y1', '0%')
		.attr('y2', '0%');
	    
	    grad.selectAll('stop')
		.data(colors)
		.enter()
		.append('stop')
		.style('stop-color', function(d){ return d; })
		.attr('offset', function(d,i){
		    return 100 * (i / (colors.length - 1)) + '%';
		})

	    var rectGroup = svg.append("g")
	    	//.attr("transform", "translate(10,0)")
		.attr("class", "rectGroup")

	    rectGroup.selectAll()
		.data(plotValues)
		.enter()
		.append("rect")
		.attr("x", function(d) { return x(d.x) })
		.attr("y", function(d) { return y(d.y) })
		.attr("width", x.bandwidth() )
		.attr("height", y.bandwidth() )
		.style("fill", "#6eb2b5")
	    

	    var camera_circle = rectGroup.selectAll()
	    	.data(this.data)
		.enter()
		.append("g")

	    var radialGradient = camera_circle.append("defs")
		.append("radialGradient")
		.attr("id", (d,i) => {
		    console.log("radial-gradient"+i)
		    return "radial-gradient"+i
		})
	    radialGradient.append("stop")
		.attr("offset", "0%")
		.attr("stop-opacity", "0.7")
		.attr("stop-color", d => {
		    return colorScale(d.numwarnings); 
		})
	    
	    radialGradient.append("stop")
		.attr("offset", "100%")
		.attr("stop-opacity", ".1")
	    	.attr("stop-color", d => {
		    return colorScale(d.numwarnings); 
		})
		//.attr("stop-color", "#6eb2b5");
	    // big circles
	    camera_circle.append("circle")
		.attr("r", d => {
		    return d.numwarnings*1.3
		})
		.attr("cx", d => {
		    return x(d.x) + x.bandwidth()/2
		})
		.attr("cy", d => {
		    return y(d.y) + y.bandwidth()/2
		})
	    	//.style("opacity", 0.5)
		.style("fill", (d, i) => {
		    return "url(#radial-gradient"+i+")"
		})
	    	.on("click", val => {
		    this.$emit('camIdChanged', val)
		})

	    
	    camera_circle.append("circle")
		.attr("r", 10)
		.attr("cx", d => {
		    return x(d.x) + x.bandwidth()/2
		})
		.attr("cy", d => {
		    return y(d.y) + y.bandwidth()/2
		})
		.style("stroke", "gray")
		.style("fill", d => {
		    return colorScale(d.numwarnings)
		})
	    	.on("click", val => {
		    this.$emit('camIdChanged', val)
		})

	    camera_circle.append("text")
	    	.text(d => {
		    return d.camlabel
		})
		.style("font-size", "10px")
		.attr("transform", (d, i) => {
		    let dx = x(d.x) + x.bandwidth() / 3.2
		    let dy = y(d.y) + y.bandwidth() /1.5
		    return "translate(" + dx + "," + dy + ")"
		})
	    

	    
	    var legend = svg.append('g')
		.attr("class", "cam-legend")
    		.attr("transform", "translate(0,120)")
	    
	    let legend_x = this.svgWidth*0.05
	    let legend_y = this.svgHeight * 0.8 
	    
	    legend.append("rect")
		.attr('x', legend_x)
		.attr('y', legend_y)
		.attr('width', this.svgWidth*0.9)
		.attr('height', 10)
		.style('fill', 'url(#grad)');

	    legend.append("text")
		//.attr("class", "legendText")
		.attr("text-anchor", "end")
		.attr("y",  legend_y + 10)
		.attr("x", this.svgWidth*0.995)
		.text(colorDomain[1])
	    
	    legend.append("text")
		//.attr("class", "legendText")
		//.attr("text-anchor", "end")
		.attr("y",  legend_y + 10)
		.attr("x", this.svgWidth*0.01)
		.text(colorDomain[0])
	    
	    legend.append("text")
	    	.attr("y",  legend_y + 20)
		.attr("x", this.svgWidth*0.4)
	    	.style("font-size", "10px")
		.text("Number of diseased zones")
	},
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
	    return scaleBand()
		.rangeRound([this.svgWidth*0.16, this.svgWidth*0.6])
		.padding(0.6)
		.domain(
		    this.data.map(d => {
			return d[this.xKey];
		    })
		);
	},
	yScale() {
	    return scaleLinear() 
		.rangeRound([this.svgHeight, 0])
		.domain([this.dataMin > 0 ? 0 : this.dataMin, this.dataMax]);
	},
	svgHeight() {
	    return this.svgWidth
	}
    }
};
</script>

<style>
  
.rect-heatmap:hover {
    stroke: white;
    stroke-width: 3;
    transition: r 0.2s ease-in-out;
}

.green {
    fill: #7fd76b;
}

.rect-positive:hover {
    fill: #7fd76b;
}

.svg-heatmap-container {
    display: inline-block;
    position: relative;
    width: 100%;
    padding-bottom: 1%;
    vertical-align: top;
    overflow: hidden;
}
.stop-left {
    stop-color: #3f51b5;  /* Indigo */
}

.stop-right {
    stop-color: #009688;  /* Teal */
}

.filled {
    fill: url(#mainGradient);
}

.outlined {
    fill:   none;
    stroke: url(#mainGradient);
    stroke-width: 4;
}
</style>
