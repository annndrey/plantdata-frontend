<template>
<div id="bar-container" class="svg-bar-container mt-5" align="center">
  <svg id="bar-chart" v-if="redrawToggle === true" :width="svgWidth" :height="svgHeight+0.2*svgHeight">
  </svg>
</div>
</template>

<script>
import { scaleLinear, scalePoint, scaleBand } from "d3-scale";
import { max, min } from "d3-array";
import { select, selectAll } from "d3-selection";
import { transition } from "d3-transition";
import { axisBottom, axisLeft } from 'd3';
import moment from 'moment'

export default {
    name: "AdvancedBarChart",
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
	    const vm = this;
	    let last_date = moment(this.data.slice(-1)[0].name).format('DD/MM/YY')
	    let today_date = moment().format('DD/MM/YY');
	    let last_day_text = null
	    if (last_date == today_date) {
		last_day_text = "today"
	    } else {
		last_day_text = last_date
	    }


	    let xticks = this.data.map((obj) => {
		return  moment(obj.name).locale('en').format('MMM D')
		})

	    let maxValue = max(this.data, d => {
		return d[this.yKey];
	    })
	    let step = 20
	    let yticks = Array.from({length:maxValue},(v,k)=>k)

	    var x = scalePoint()
		.domain(xticks)  
		.range([this.svgWidth*0.040, this.svgWidth*0.97])
	    
	    var y = scaleLinear()
		.domain([min(yticks), max(yticks)])
		.range([this.svgHeight, 0])
	    
	    //console.log(this.data.map( d => this.xScale(d[this.xKey])))
	    //console.log(this.svgWidth*0.035, this.svgWidth*0.965)
	    
	    var svg = select("#bar-chart")
	    	.attr("width", this.svgWidth)
		.attr("height", this.svgHeight)

	    var xlabels = svg.append("g")
	    	.attr("class", "axis")
		.attr("transform", "translate(0," + this.svgHeight * 1.03 + ")")
		//.attr("class", "barGroup")
		.call(axisBottom(x)
		      .tickSize(-this.svgHeight, 0, 0)
		     )
	    
	    xlabels.selectAll(".tick:not(:first-of-type) line").attr("stroke", "lightgray").attr("stroke-dasharray", "1,4")
	    xlabels.selectAll(".tick:first-of-type line").attr("stroke", "lightgray").attr("stroke-dasharray", "1,4")
	    
	    var ylabels = svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(22,2)")
		//.attr("class", "barGroup")
		.call(axisLeft(y)
		      .tickSize(-this.svgWidth, 0, 0)
		     )
	    
	    ylabels.selectAll(".tick:not(:first-of-type) line").attr("stroke", "lightgray").attr("stroke-dasharray", "1,4")
	    ylabels.selectAll(".tick:first-of-type line").attr("stroke", "white").attr("stroke-dasharray", "1,4")
	    
	    var barGroup = svg.append("g")
	    //.attr("transform", "translate(0, 150)")
	    	.attr("transform", "translate(10,0)")// + this.svgHeight*-0.1 + ")")
		.attr("class", "barGroup")

	    var rect = barGroup.selectAll("rect")
		.data(this.data)
		.enter()
		.append("rect")
		.attr("x", d => {
		    return this.xScale(d[this.xKey])
		})
		.attr("data", d => d[this.xKey])
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
		.on("click", val => {
		    //d3.select(this).attr("r", 12);
		    selectAll("rect").classed("green", false)
		    select("[data='" + val.name+ "']")
			.attr("class", "bar-positive green")
		    //select(this).classed("bar-positive green", true)
		    //select(this).attr("class", "bar-positive green")
		    //console.log("Rectangle clicked", this)
		    this.$emit('barDateChanged', val)
		})
	    
	    selectAll(".bar-positive")
		.data(this.data)
		.transition()
		.delay((d, i) => {
		    return i * 100;
		})
		.duration(800)
		.attr("y", d => {
		    return this.yScale(d[this.yKey]);
		})
		.attr("height", d => {
		    return this.svgHeight - this.yScale(d[this.yKey]);
		})
	    
	    xlabels.selectAll('text').filter( d => {
		let n = d.split(" ")[1]
		//console.log(n % 2 == 0)
		return n % 2 == 0
	    })
		.attr('class', 'text-lght')
	    
	    this.$emit('barDateChanged', this.data.slice(-1)[0])
	    
	    //select(".barGroup").append("text")
	//	.attr("y", this.svgHeight*0.6)//magic number here
	//	.attr("x", this.svgWidth*0.7)
	//	.attr('text-anchor', 'middle')
	//	.attr("class", "barText")//easy to style with CSS
	//	.text(this.data.slice(-1)[0].amount);
	//    select(".barGroup").append("text")
	//	.attr("y", this.svgHeight*0.85)//magic number here
	//	.attr("x", this.svgWidth*0.7)
	//	.attr('text-anchor', 'middle')
	//	.attr("class", "barTextSmall")//easy to style with CSS
	//	.text(last_day_text);
	//    console.log(this.data.slice(-1)[0].amount)
	    
	},
	AddResizeListener() {
	    // redraw the chart 300ms after the window has been resized
	    window.addEventListener("resize", () => {

		setTimeout(() => {
		    this.$data.redrawToggle = true;
		    this.$data.svgWidth =
			document.getElementById("bar-container").offsetWidth * 1;
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
		.rangeRound([this.svgWidth*0.01, this.svgWidth*0.99])
		.padding(0.1)
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
    fill: #e4e9dd;
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
  .text-lght {
      opacity: 0.5
  }
  .domain {
      visibility:hidden;
  }
  .axis {
      font-size: 0.5em;
  }
      
</style>
