<template>
<div id="pie-container" class="svg-pie-container mt-5" align="center">
  <svg id="pie-chart" v-if="redrawToggle === true" :width="svgWidth" :height="svgHeight">
  </svg>
</div>

</template>

<script>
import {arc, select, transition, interpolate } from "d3"
export default {
    name: "PieChart",
    props: {
	percent: Number
    },
    watch: { 
      	percent: function(newVal, oldVal) { // watch it
	    this.DrawArcs()
        }
    },
    mounted() {
	this.svgWidth = document.getElementById("pie-container").offsetWidth * 0.4
	this.DrawArcs()
	//this.AddResizeListener();
	//this.AnimateLoad();
    },
    data: () => ({
	svgWidth: 0,
	redrawToggle: true
    }),
    methods: {
	DrawArcs() {
	    select("#pie-chart").selectAll("*").remove()
	    select(".pieGroup").remove()

	    var width = this.svgWidth
	    var height = this.svgWidth
	    var τ = (Math.PI/180)
	    
	    var arc1 = arc()
		.innerRadius(width/2-8)
		.outerRadius(width/2)
	    
	    var arc2 = arc()	
		.innerRadius(width/2-8)
		.outerRadius(width/2)        

	    
	    var svg = select("#pie-chart")
	    	.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
		.attr("class", "pieGroup")//easy to style with CSS
	    
	    var foreground = svg.append("path")
		.datum({
		    endAngle: 0 * τ,
		    startAngle: 0 * τ
		})
		.style("fill", "#1f6c39")
		.attr("d", arc1);
	    
	    var background = svg.append("path")
		.datum({
		    endAngle: 0 * τ,
		    startAngle: 0 * τ
		})
		.style("fill", "#7fd76b")
		.attr("d", arc1);
	    foreground.transition()
		.duration(200)
		.call(this.arcTween, 360 * τ, 0 * τ, arc1);

	    var arcEnd = (this.percent/100.)*360
	    
	    background.transition()
		.duration(1300)
		.call(this.arcTween, arcEnd * τ, 0 * τ, arc2);
	    
	    svg.append("text")
		.attr("y", this.svgWidth*0.07)//magic number here
		.attr("x", this.svgWidth*0.01)
		.attr('text-anchor', 'middle')
		.attr("class", "pieText")//easy to style with CSS
		.text(this.percent+"%");

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
	arcTween(transition, newStartAngle, newFinishAngle, arc) {
	    
            transition.attrTween("d", function (d) {
		var interpolateStart = interpolate(d.startAngle, newStartAngle);
		return function (t) {
            	    d.endAngle = newFinishAngle;
                    d.startAngle = interpolateStart(t);
                    return arc(d);
		}
            })
	}
    },
    computed: {
	svgHeight() {
	    return this.svgWidth 
	}
    }
};
</script>

<style>
  .pieText {
  fill: white;
  font-size: 1.2em;
  font-weight: bold;
  }
</style>
