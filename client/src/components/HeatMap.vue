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
import { zoom } from "d3-zoom";
import { quadtree } from "d3-quadtree";
import * as d3 from 'd3'
import moment from 'moment'

export default {
    name: "HeatMap",
    props: {
	title: String,
	xKey: String,
	yKey: String,
	data: Array,
	dimX: Number,
	dimY: Number,
	campositions: Array
    },
    watch: { 
      	data: function(newVal, oldVal) { 
	    //this.svgWidth = document.getElementById("heatmap-container").offsetWidth/2 + 100
	    this.drawPlot()
        },
	campositions: function(newVal, oldVal) {
	    console.log("CAMPOS CHANGED")
	    if (this.campositions) {
		this.drawPoints()
	    }
	}
    },
    mounted() {
	this.svgWidth = document.getElementById("heatmap-container").offsetWidth/2
	console.log("heatmap", this.data)
	this.drawPlot()
    },
    data: () => ({
	svgWidth: 0,
	redrawToggle: true
    }),
    methods: {
	
	drawPoints(){
	    function nodes(quadtree) {
		var nodes = [];
		quadtree.visit(function(node, x0, y0, x1, y1) {
		    node.x0 = x0, node.y0 = y0;
		    node.x1 = x1, node.y1 = y1;
		    nodes.push(node);
		});
		return nodes;
	    }
	    function qtreesearch(quadtree, x0, y0, x3, y3) {
		var validData = []
		quadtree.visit(function(node, x1, y1, x2, y2) {
		    if (!node.length) {
			do {
			    var d = node.data;
			    d.selected = (d[0] >= x0) && (d[0] < x3) && (d[1] >= y0) && (d[1] < y3);
			    if (d.selected) {
				validData.push(d);
			    }
			} while (node = node.next);
		    }
		    return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
		})
		return validData
	    }
	    
	    var plotGroups = Array.from({length:this.dimX},(v,k)=>k)
	    var plotVars = Array.from({length:this.dimY},(v,k)=>k)

	    var colors =  ["green", "red"]
	    var color = scaleLinear()
		.range(colors)
		.domain([0, 100])

	    
	    var svg = select("#heatmap-chart")
	    var pointsGroup = svg.append("g")
		.attr("class", "pointsGroup")

	    var clusterGroup = svg.append("g")
		.attr("class", "clusterGroup")
	    
	    
	    var x = scaleLinear()
		.range([ 0, this.svgWidth ])
		.domain(extent(plotGroups))
	    
	    var y = scaleLinear()
		.range([ this.svgHeight, 0 ])
		.domain(extent(plotVars))


	    var qtreedata = this.campositions.map( d=> {
		return [x(d.posx), y(d.posy), d.health]
	    })

	    var qtree = quadtree()
		.extent([[-1, -1], [this.svgWidth + 1, this.svgHeight + 1]])
		.addAll(qtreedata)
	    
	    //var clusterPoints = [];
	    //var clusterRange = this.dimX*10
	    
	    //for (let x = 0; x <= this.svgWidth; x += clusterRange) {
	//	for (let y = 0; y <= this.svgHeight; y+= clusterRange) {
	//	    var searched = qtreesearch(qtree, x, y, x + clusterRange, y + clusterRange);
	//	    //console.log("searched", searched)
	//	    var centerPoint = searched.reduce(function(prev, current) {
	//		return [prev[0] + current[0], prev[1] + current[1]];
	//	    }, [0, 0]);
	//	    
	//	    centerPoint[0] = centerPoint[0] / searched.length;
	//	    centerPoint[1] = centerPoint[1] / searched.length;
	//	    centerPoint.push(searched);
	//	    
	//	    if (centerPoint[0] && centerPoint[1]) {
	//		clusterPoints.push(centerPoint);
	//	    }
	//	}
	  //  }

	    //console.log("cluster points", clusterPoints)
	    //
	    svg.selectAll(".node")
		.data(nodes(qtree))
		.enter().append("rect")
		.attr("class", "node")
		.attr("x", function(d) { return d.x0; })
		.attr("y", function(d) { return d.y0; })
		.attr("width", function(d) { return d.y1 - d.y0; })
		.attr("height", function(d) { return d.x1 - d.x0; });
	    

	    //var cluster_circle = clusterGroup.selectAll()
		//.data(clusterPoints)
	    	//.enter()
	    	//.append("g")


	    //cluster_circle.append("circle")
		//.style("opacity", 0.3)
	    	//.attr("cx", function (d) { return d[0] } )
		//.attr("cy", function (d) { return d[1] } )
		//.attr("r", 10)
	    
	    var health_circle = pointsGroup.selectAll()
		.data(this.campositions)
	    	.enter()
	    	.append("g")

	    health_circle.append("circle")
		.style("opacity", 1)
	    	.attr("cx", function (d) { return x(d.posx); } )
		.attr("cy", function (d) { return y(d.posy); } )
		.attr("r", 0)
		//.attr("r", function(d) {
		//    if ( d.health) {
		//	let rd = Math.sqrt(1-d.health/100)*15
		//	//console.log("HEALTH", d.health, rd)
		//	if (rd > 0) {
		//	    return rd
		//	} else {
		//	    return 1
		//	}
	    //  } else {
	//		return 1
	//	    }
	//	})
		.style("fill", function(d) {
		    if (d.health ) {
			let infestation = 100-d.health
			//console.log("inf", infestation)
			return color(infestation)
			//console.log(d.health, color(d.health))
			//if (d.health < 100) {
			//    //console.log("HCOLOR", d.health, "red")
			//    return "red"
			//} else {
			//    //console.log("HCOLOR", d.health, "black1")
			//    return  "black"
			//	}
		    } else {
			//console.log("HCOLOR", d.health, "black2")
			return "black"
		    }
		})
	    
	    
	    //health_circle
	    //	.on("mouseover", function(d,i) {
	    //	    let el = select(this)
	    //	    //if (!el.text) {
	    //	    el.append("text")
	    //		.text( d.position + ": " + d.health.toFixed(2) )
	    //		.attr("x", x(d.posx))
	    //		.attr("y", y(d.posy))
	    //	    //}
	    //	    //else { 
	    //		//el.style("opacity", 1)
	    //	    //}
	    //	})
	    //	.on("mouseout",function(){
	    //	    //code for transition
	    //	    //let el = select(this)
	    //	    //el.style("opacity", 0)
	    //	})
	    
	    //health_circle.append("text")
	    //	.text(d => {
	    //	    if (d.health > 0) {
	    //		return d.position
	    //	    }
	    //	})
	    //  	.style("font-size", "10px")
	    //	.style("fill", "#21aba5")
	    //  	.attr("transform", (d, i) => {
	    //	    if ( d.health > 0) {
	    //  		let dx = x(d.posx)
	    //		let dy = y(d.posy)
	    //		return "translate(" + dx + "," + dy + ")"
	    //	    }
	    //	})
	    var svgWidth = this.svgWidth
	    var svgHeight = this.svgHeight
	    var dimX = this.dimX
	    
	    svg.call(d3.zoom()
		     .scaleExtent([1, 6.1])
		     .on("zoom", function () {
			 //svg.attr("transform", d3.event.transform)
			 //console.log("zoom", d3.event.transform.k)
			 if (d3.event.transform.k <= 6.1) {
			     select(".clusterGroup").remove()
			     var clusterGroup = svg.append("g")
				 .attr("class", "clusterGroup")
			     
			     var clusterPoints = [];
			     let clrange = Math.round((30/d3.event.transform.k)/10)*10
			     
			     var clusterRange = clrange > 1 ? clrange : 1 //Math.round(clrange*13)/13
			     //console.log("CLRANGE", clusterRange)
			     //console.log("zoom", svgWidth, svgHeight)
			     for (let x = 0; x <= svgWidth; x += clusterRange) {
				 for (let y = 0; y <= svgHeight; y+= clusterRange) {
				     var searched = qtreesearch(qtree, x, y, x + clusterRange, y + clusterRange);
				     //console.log("searched",  searched)
				     var centerPoint = searched.reduce(function(prev, current) {
					 return [prev[0] + current[0], prev[1] + current[1]];
				     }, [0, 0]);
				     
				     centerPoint[0] = centerPoint[0] / searched.length;
				     centerPoint[1] = centerPoint[1] / searched.length;
				     centerPoint.push(searched);
				     
				     if (centerPoint[0] && centerPoint[1]) {
					 clusterPoints.push(centerPoint);
				     }
				 }
			     }
			     
			     //console.log("new cluster points", clusterPoints)
			     var cluster_circle = clusterGroup.selectAll()
				 .data(clusterPoints)
	    			 .enter()
	    			 .append("g")
			     
			     
			     cluster_circle.append("circle")
				 .style("opacity", 1)
	    			 .attr("cx", function (d) { return d[0] } )
				 .attr("cy", function (d) { return d[1] } )
				 .attr("r", function (d) { return d[2].length > 2 ? d[2].length / 2 : 2 } )
				 .style("fill", function(d) {
				     let mean = d[2].reduce( function (sum, value) {
					 return sum + value[2]
				     }, 0) / d[2].length
				     return color(100-mean)
				 })
			     
			     cluster_circle.append("text")
	    			 .text(d => {
				     return d[2].length
				 })
				 .style("font-size", "10px")
				 .attr("text-anchor", "middle")
				 .attr("dominant-baseline", "middle")
				 .attr("transform", (d, i) => {
				     let dx = d[0]
				     let dy = d[1]
				     return "translate(" + dx + "," + dy + ")"
				 })

			     
			    } 
			 }))


	},
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
		.attr('x2', '0%')
		.attr('y1', '100%')
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
		    return 10
		    //return d.numwarnings*1.3
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
		    let dx = x(d.x) + x.bandwidth() / 0.8
		    let dy = y(d.y) + y.bandwidth() /1.5
		    return "translate(" + dx + "," + dy + ")"
		})
	    

	    
	    var legend = svg.append('g')
		.attr("class", "cam-legend")
    	    //.attr("transform", "translate(0,120)")
		.attr("transform", "translate(" + this.svgWidth*0.25 + ", " + this.svgWidth*0.06 + ")")
	    
	    let legend_y = this.svgWidth*0.05
	    let legend_x = this.svgHeight * 0.8 
	    
	    //legend.append("rect")
	//	.attr('x', legend_x)
	//	.attr('y', legend_y)
	//	.attr('width', this.svgWidth*0.01)
	//	.attr('height', this.svgHeight * 0.8)
	//	.style('fill', 'url(#grad)');
//
//	    legend.append("text")
//		//.attr("class", "legendText")
//		.attr("text-anchor", "end")
//		.attr("y",  legend_y*0.7)
//		.attr("x", legend_x+legend_x*0.05)
//		.text(colorDomain[1])
//	    
//	    legend.append("text")
//		//.attr("class", "legendText")
//		//.attr("text-anchor", "end")
//		.attr("y",  this.svgHeight*0.885)
//		.attr("x", legend_x-legend_x*0.04)
//		.text(colorDomain[0])
//	    
//	    legend.append("text")
//	    	.attr("y",  -this.svgWidth*0.83)
//		.attr("x", this.svgWidth*0.3)
//	    	.style("font-size", "10px")
//		.attr("transform", "rotate(90)")
//		.text("Number of diseased zones")
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
.node {
  fill: none;
  stroke: #ccc;
  shape-rendering: crispEdges;
}
</style>
