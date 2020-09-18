<template>
<div id="heatmap-container" class="svg-heatmap-container mt-4" align="center">
  <svg id="heatmap-chart" v-if="redrawToggle === true" :width="svgWidth" :height="svgHeight">
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
	data: Array
    },
    watch: { 
      	data: function(newVal, oldVal) { 
	    this.svgWidth = document.getElementById("heatmap-container").offsetWidth 
	    this.drawPlot()
        }
    },
    mounted() {
	this.svgWidth = document.getElementById("heatmap-container").offsetWidth
	console.log("heatmap", this.svgWidth)
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
	    var colors = [ '#e0f7d2', '#fa5061' ]

	    console.log("HM DATA", this.data)
	    
	    var colorDomain = extent(this.data, function(d){
		return d.numwarnings
	    })

	    var colorScale = scaleLinear()
		.domain(colorDomain)
		.range(colors)
	    
	    var svg = select("#heatmap-chart")
	    	.attr("width", this.svgWidth)
		.attr("height", this.svgHeight)
		.append("g")
		.attr("class", "heatmapGroup")
		.attr("transform", "translate(" + this.svgWidth*0.35 + ",0)")
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
	    
	    var rect_g = svg.selectAll("rect")
		.data(this.data)
		.enter()
		.append("g")

	    rect_g.append("rect")
		.attr("class", "rect-heatmap")
		.attr("x", d => {
		    return d.x * this.svgWidth*0.29/this.data.length
		})
		.attr("y", d => {
		    return d.y * this.svgHeight*0.7/this.data.length			
		})
		.attr("width", this.svgWidth*0.28/this.data.length)
		.attr("height", this.svgHeight*0.7)
		.style("fill", d => {
		    return colorScale(d.numwarnings); 
		})
	    	.on("click", val => {
		    this.$emit('camIdChanged', val)
		})

	    rect_g.append("text") 
		.text(d => {
		    return d.camlabel
		})
		.style("font-size", "10px")
		.attr("transform", (d, i) => {
		    let dx = d.x * this.svgWidth*0.29/this.data.length + 3
		    let dy = 76
		    return "translate(" + dx + "," + dy + ")"
		    
		})
	    

	    
	    var legend = svg.append('g')

	    let legend_x = this.svgWidth*0.075
	    let legend_y = this.svgHeight * 0.8 
	    
	    legend.append("rect")
		.attr('x', legend_x)
		.attr('y', legend_y)
		.attr('width', 150)
		.attr('height', 10)
		.style('fill', 'url(#grad)');

	    legend.append("text")
		//.attr("class", "legendText")
		.attr("text-anchor", "end")
		.attr("y",  legend_y + 10)
		.attr("x", legend_x*3.1)
		.text(colorDomain[1])
	    
	    legend.append("text")
		//.attr("class", "legendText")
		//.attr("text-anchor", "end")
		.attr("y",  legend_y + 10)
		.attr("x", legend_x*0.7)
		.text(colorDomain[0])
	    
	    legend.append("text")
	    	.attr("y",  legend_y + 20)
		.attr("x", legend_x*1.1)
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
	    return this.svgWidth *0.1/// 1.61803398875; // golden ratio
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
