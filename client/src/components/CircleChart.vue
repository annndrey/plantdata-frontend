<template>
<div id="circle-container" class="svg-circle-container mt-2" align="center">
  <svg id="circle-chart" v-if="redrawToggle === true" :width="svgWidth" :height="svgHeight">
  </svg>
</div>

</template>

<script>
import {circle, select, transition, interpolate } from "d3"
export default {
    name: "CircleChart",
    props: {
	amount: Number
    },
    watch: { 
      	amount: function(newVal, oldVal) { // watch it
	    this.DrawCircle()
        }
    },
    mounted() {
	this.svgWidth = document.getElementById("pie-container").offsetWidth * 0.4
	this.DrawCircle()
	//this.AddResizeListener();
	//this.AnimateLoad();
    },
    data: () => ({
	svgWidth: 0,
	redrawToggle: true
    }),
    methods: {
	DrawCircle() {
	    select("#circle-chart").selectAll("*").remove()
	    select(".circleGroup").remove()

	    var width = this.svgWidth
	    var height = this.svgWidth
	    
	    var svg = select("#circle-chart")
	    	.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("class", "circleGroup")
	    
	    var circle = svg.append("circle")
		.style("fill", "white")
		.attr("cx", width / 2)
		.attr("cy", height / 2)
		.attr("r", 1)
	    
	    circle.transition()
		.duration(1300)
    		.attr('r', width/2);

	    svg.append("text")
		.attr("y", this.svgWidth*0.55)
		.attr("x", this.svgWidth*0.48)
		.attr('text-anchor', 'middle')
		.attr("class", "circleText")
		.text(this.amount);

	},
	
	//AddResizeListener() {
	//    // redraw the chart 300ms after the window has been resized
	//    window.addEventListener("resize", () => {
	//	this.$data.redrawToggle = false;
	//	setTimeout(() => {
	//	    this.$data.redrawToggle = true;
	//	    this.$data.svgWidth =
	//		document.getElementById("bar-container").offsetWidth * 0.75;
	//	    this.AnimateLoad();
	//	}, 300);
	//    });
	//},
    
    },
    computed: {
	svgHeight() {
	    return this.svgWidth 
	}
    }
};
</script>

<style>
  .circleText {
  fill: black;
  font-size: 1.2em;
  font-weight: bold;
  }
</style>
