<template>
<div id="bar-container" class="svg-bar-container mt-5" align="center">
  <svg id="bar-chart" v-if="redrawToggle === true" :width="svgWidth" :height="svgHeight">
  </svg>
</div>
</template>

<script>
import { scaleLinear, scaleBand } from "d3-scale";
import { max, min } from "d3-array";
import { select, selectAll } from "d3-selection";
import { transition } from "d3-transition";
import moment from 'moment'

export default {
    name: "BarChart",
    props: {
	title: String,
	xKey: String,
	yKey: String,
	data: Array
    },
    watch: { 
      	data: function(newVal, oldVal) { // watch it
	    this.svgWidth = document.getElementById("bar-container").offsetWidth 
	    this.AnimateLoad()
        }
    },
    mounted() {
	this.svgWidth = document.getElementById("bar-container").offsetWidth 
	//this.AddResizeListener();
	this.AnimateLoad();
    },
    data: () => ({
	svgWidth: 0,
	redrawToggle: true
    }),
    methods: {
	AnimateLoad() {
	    select("#bar-chart").selectAll("*").remove()
	    select(".barGroup").remove()
	    
	    let last_date = moment(this.data.slice(-1)[0].name).format('DD/MM/YY')
	    let today_date = moment().format('DD/MM/YY');
	    let last_day_text = null
	    if (last_date == today_date) {
		last_day_text = "today"
	    } else {
		last_day_text = last_date
	    }
	    
	    var svg = select("#bar-chart")
	    	.attr("width", this.svgWidth)
		.attr("height", this.svgHeight)
		.append("g")
		//.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
		.attr("class", "barGroup")
	    
	    var rect = svg.selectAll("rect")
		.data(this.data)
		.enter()
		.append("rect")
		.attr("x", d => {
		    return this.xScale(d[this.xKey])
		})
		.attr("y", d => {
		    return this.yScale(0)
		})
		.attr("width", d =>  {
		    return this.xScale.bandwidth()
		})
		.attr("height", 0)
		.attr("class", d => {
		    if (this.data.slice(-1)[0].name === d.name) {
			return "bar-positive green"
		    } else {
			return "bar-positive"
		    }
		})
	    
	    selectAll(".bar-positive")
		.data(this.data)
		.transition()
		.delay((d, i) => {
		    return i * 150;
		})
		.duration(1000)
		.attr("y", d => {
		    return this.yScale(d[this.yKey]);
		})
		.attr("height", d => {
		    var hght = 1
		    if (d[this.yKey] > 0) {
			hght = this.svgHeight - this.yScale(d[this.yKey])
		    }
		    return hght
		})
	    
	    select(".barGroup").append("text")
		.attr("y", this.svgHeight*0.6)//magic number here
		.attr("x", this.svgWidth*0.7)
		.attr('text-anchor', 'middle')
		.attr("class", "barText")//easy to style with CSS
		.text(this.data.slice(-1)[0].amount);
	    select(".barGroup").append("text")
		.attr("y", this.svgHeight*0.85)//magic number here
		.attr("x", this.svgWidth*0.7)
		.attr('text-anchor', 'middle')
		.attr("class", "barTextSmall")//easy to style with CSS
		.text(last_day_text);
	    console.log(this.data.slice(-1)[0].amount)
	    
	},
	AddResizeListener() {
	    // redraw the chart 300ms after the window has been resized
	    window.addEventListener("resize", () => {

		setTimeout(() => {
		    this.$data.redrawToggle = true;
		    this.$data.svgWidth =
			document.getElementById("bar-container").offsetWidth * 0.75;
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
	    return this.svgWidth *0.2/// 1.61803398875; // golden ratio
	}
    }
};
</script>

<style>
  
.bar-positive {
    fill: white;
    transition: r 0.2s ease-in-out;
}

.green {
    fill: #7fd76b;
}

.bar-positive:hover {
    fill: #7fd76b;
}

.svg-bar-container {
    display: inline-block;
    position: relative;
    width: 100%;
    padding-bottom: 1%;
    vertical-align: top;
    overflow: hidden;
}
  .barText {
  fill: white;
  font-size: 1.2em;
  font-weight: bold;
  }
  .barTextSmall {
  fill: #7fd76b;
  font-size: 0.8em;
  font-weight: bold;
  }

</style>
