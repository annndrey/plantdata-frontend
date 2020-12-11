<template>
<div id="line-container" class="svg-line-container" align="center">
  <svg id="line-chart" v-if="redrawToggle === true" :width="svgWidth" :height="svgHeight+100"></svg>
  <div id='tooltip' style='position:absolute;background-color:#f6f7f9;padding:0px;top:0px;left:0px'></div>
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
	probedata: Array,
	limits: Array
    },
    watch: {
	probedata: function(newVal, oldVal) {
	    console.log("PROBE DATA CHANGED", newVal)
	    console.log("REDRAW ALL")
	    
	    //this.AnimateLoad()
	},
      	data: function(newVal, oldVal) {
	    if (document.getElementById("line-container").offsetWidth > 0) {
		this.svgWidth = document.getElementById("line-container").offsetWidth
	    }
	    console.log("REDRAW LINES")
	    this.AnimateLoad()
        },
	localMax: function(newVal, oldVal) { 
	    this.svgWidth = document.getElementById("line-container").offsetWidth
	    this.AnimateLoad()
        },
    },
    mounted() {
	this.svgWidth = document.getElementById("line-container").offsetWidth 
	//this.AddResizeListener();
	//this.AnimateLoad();
    },
    data: () => ({
	svgWidth: 0,
	redrawToggle: true,
	localMax: null
    }),
    methods: {
	fixSensorName(fullname) {
	    let [sens, prb] = fullname.split(" ")
	    let fixedSens = "Sens"
	    if (sens.startsWith("T")) {
		fixedSens = "Temp"
	    } else if (sens.startsWith("H")) {
		fixedSens = "Humid"
	    } else if (sens.startsWith("C")) {
		fixedSens = "CO2"
	    }
			
	    let button_text = " " + fixedSens + " mod. #" + this.probedata[prb] + " "
	    return button_text
	},
	AnimateLoad() {
	    console.log("Limits", this.limits.length)
	    select("#line-chart").selectAll("*").remove()
	    select(".lineGroup").remove()
	    select(".limitsGroup").remove()
	    let fixSensorName = this.fixSensorName
	    const vm = this
	    var plotdata = []
	    var colors = [ "#9472F7", "#7A6CD9", "#8484F0",
			   "#CC5B3F", "#CC4F45", "#C24342",
			   "#99986A", "#99946E", "#8F8967",
			   "#4B946C", "#4FAB84", "#4FAB6C",
			   "#1B9194", "#1696AB", "#16AB9A",
			   "#4F6194", "#5275AB", "#4D78A1",
			   "#AB5A4B", "#AB4D4B", "#A14757",
			   "#AB8B63", "#AB8163", "#A1755D",
			   "#94AD55", "#ADAD5A", "#A39F55",
			   
			 ]
	    var datakeys = []
	    var svgHeight = this.svgHeight
	    var svgWidth = this.svgWidth
	    
	    Object.keys(this.data.data).map( k => {
		var objlist = []
		datakeys.push(k)
		var datalabels = this.data.probelabels[k.slice(3, k.length)]
		console.log("K", k.split(" ")[3])
		datalabels.map((obj, index) => {
		    let label = moment(obj).toDate()
		    let val =  this.data.data[k][index]
		    objlist.push({"date": label, "value": val})
		})
		plotdata.push(objlist)
	    })

	    console.log("Plot data", plotdata)
	    
	    let xtickstime = this.data.labels.map((obj) => {
		return  moment(obj).toDate()
	    })
	    
	    const datalists = Object.keys(this.data.data).map((k) => this.data.data[k])
	    const highestAmount = max(datalists.map(d => max(d)))
	    let yticks = Array.from({length:highestAmount},(v,k)=>k)

	    var xtime = scaleTime()
		.domain([xtickstime[0], xtickstime[xtickstime.length-1]])
		//.domain(d3.extent(...xtickstime))
		.range([this.svgWidth*0.01, this.svgWidth*0.99])
		//.nice()
	    
	    var miny = min(yticks)
	    var maxy = max(yticks) + 10
	    
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
	    

    	    var xlabelstime = svg.append("g")
	    	.attr("class", "axisBottom")
	    	.attr("transform", "translate(" + this.svgWidth * 0.01 + "," + this.svgHeight * 1.2 + ")")
		.call(axisBottom(xtime)
		      .ticks(24)
		      .tickFormat(d3.timeFormat("%d/%m %H:%M"))
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

	    xlabelstime.selectAll("text")
		.attr("transform", "rotate(-35), translate(-"+this.svgWidth*0.03+",0)")

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

	    
	    
	    var short_sensor_names = []
	    var sensors_to_show = []
	    var lines = lineGroup.selectAll(".line")
		.data(plotdata)
		.enter().append("path")
	    	.attr("fill", "none")
		.attr("stroke-width", 1)
		.attr("d", l)
		.attr("class", "line")
		.each(function(d,i) {
		    //console.log("PLOT>>d", d)
		    var ln  = select(this)
		    let short_name = fixSensorName(datakeys[i])
		    let sens_prefix = short_name.split(" ")[1]
		    if (!short_sensor_names.includes(sens_prefix)) {
			short_sensor_names.push(sens_prefix)
			sensors_to_show.push(sens_prefix)
		    }
		    //console.log(short_name, sens_prefix)
		    ln.attr("class", "line mainline line" + i + " " + "line" + sens_prefix )
			.attr('stroke', colors[i])
			.attr("id", "line"+colors[i].substr(1, colors[i].length))
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

	    
	    if (this.limits.length > 0) {
		let loclimits = []
		Object.keys(this.limits[0].limits).map(k => {
		    let minv = this.limits[0].limits[k].minvalue
		    let maxv = this.limits[0].limits[k].maxvalue
		    
		    let lnmin = {"val": minv, "ltype": "min", "stype": k}
		    let lnmax = {"val": maxv, "ltype": "max", "stype": k}
		    loclimits.push(lnmax)
		    loclimits.push(lnmin)
		})
		
		var limitsGroup = svg.append("g")
		    .attr("clip-path", "url(#clip)")
		    .attr("transform", "translate(" + this.svgWidth*0.01 +  ", " + this.svgHeight * .2 + ")")
		    .attr("class", "limitsGroup")
		    .attr('height', this.svgHeight * 0.8)
		
		var minmaxlines = limitsGroup.selectAll(".line")
		    .data(loclimits)
		    .enter().append("line")
	    	    .attr("fill", "none")
		    .style("stroke-dasharray", ("3,3"))
		    .attr("stroke-width", 1)
		    .each(function(d,i) {
			var ln  = select(this)
			ln.attr("class", "line limitline line" + i + " " + "line-" + d.stype )
			    .attr('stroke', d.ltype == "max" ? "red" : "blue")
			    .attr("x1", 0)
			    .attr("x2", svgWidth)
			    .attr("y1", y(d.val))
			    .attr("y2", y(d.val))
			    .attr("val", d.val)
			    .style("opacity", 0.3)
		    })

	    }

	    
	    var mouseG = svg.append("g")
		.attr("class", "mouse-over-effects")
		.attr("transform", "translate(" + this.svgWidth*0.01 +  ", " + this.svgHeight * .2 + ")")
	    mouseG.append("path") // this is the black vertical line to follow mouse
		.attr("class", "mouse-line")
		.style("stroke", "black")
		.style("stroke-width", "1px")
		.style("stroke-dasharray", "3,3")
		.style("opacity", "0")
	    
	    var lines = document.getElementsByClassName('line');
	    
	    var mousePerLine = mouseG.selectAll('.mouse-per-line')
		.data(plotdata)
		.enter()
		.append("g")
		.attr("class", "mouse-per-line");

	    mousePerLine.append("circle")
		.attr("r", 4)
		.style("stroke", function (d, i) {
		    return colors[i];
		})
		.style("fill", "none")
		.style("stroke-width", "1px")
		.style("opacity", "0");
	    
	    mousePerLine.append("text")
		.attr("transform", "translate(10,3)")
		.style("font-size", "0.4em")
	    
	    //var svgHeight = this.svgHeight
	    //var svgWidth = this.svgWidth
	    mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
		.attr('width', this.svgWidth) // can't catch mouse events on a g element
		.attr('height', this.svgHeight)
		.attr('fill', 'none')
		.attr('pointer-events', 'all')
		.on('mouseout', function () { // on mouse out hide line, circles and text
		    d3.select(".mouse-line")
			.style("opacity", "0");
		    d3.select("#tooltip")
			.style("opacity", "0")
		    	.style("padding", "0px")
		    d3.selectAll(".mouse-per-line circle")
			.style("opacity", "0");
		    d3.selectAll(".mouse-per-line text")
			.style("opacity", "0");
		})
		.on('mouseover', function () { // on mouse in show line, circles and text
		    d3.select(".mouse-line")
			.style("opacity", "1")
		    d3.select("#tooltip")
			.style("opacity", "1")


		    d3.selectAll(".mouse-per-line circle")
		    	.each(function(d,i) {
			    var crcl = select(this)
			    let short_name = fixSensorName(datakeys[i])
			    let sens_prefix = short_name.split(" ")[1]
			    if (sensors_to_show.includes(sens_prefix)) {
				crcl.style("opacity", "1")
			    }
			})

		    d3.selectAll(".mouse-per-line text")
			.style("opacity", "1");
		})
		.on('mousemove', function () { // mouse moving over canvas
		    var mouse = d3.mouse(this);
		    let pos = d3.select(this).node().getBoundingClientRect()
		    let maxwidth = Math.round(pos.right)
		    let leftwidth = Math.round(pos.x)
		    const tooltip = d3.select('#tooltip')
		    tooltip.selectAll("*").remove()
		    //console.log(d3.event.pageX, maxwidth)
		    var leftposition = maxwidth/d3.event.pageX > 1.21 ? d3.event.pageX - leftwidth/1.5 : d3.event.pageX - leftwidth/1.5-300
//		    console.log("Right margin", d3.event.pageX, d3.event.pageX - leftwidth,  pos)
		    tooltip.style('display', 'block')
			.style('left', leftposition+"px")
			.style('top', d3.event.pageY-400+"px")

		    d3.selectAll(".mouse-per-line")
			.attr("transform", function (d, i) {
			    var alldates = d.map(dt => {return dt.date})
			    var allvalues = d.map(dt => {return dt.value})
			    var xDate = xtime.invert(mouse[0])
			    var bisect = d3.bisector(function(d) { return d.date; }).left
			    var idx = bisect(d, xDate)
			    //d3.select(this).select('text')
			    //	.text(y.invert(y(d[idx].value)).toFixed(2));
			    let short_name = fixSensorName(datakeys[i])
			    if (sensors_to_show.includes(short_name.split(" ")[1])) {
				if (d[idx]) {
				    //
				    tooltip.append('div')
					.html(short_name + " " + moment(d[idx].date).format('HH:mm') + ": " + d[idx].value.toFixed(2))
					.style("font-size", "0.6em")
					.style("color", colors[i])
				    tooltip.style("padding", "5px")

				}
			    } 
			    d3.select(".mouse-line")
				.attr("d", function () {
				    if ( d[idx] ) {
					var data = "M" + xtime(d[idx].date) + "," + svgHeight
					data += " " + xtime(d[idx].date) + "," + 0
					return data
				    } else {
					tooltip.style("padding", "0px")
				    }
				});
			    if (d[idx]) {
				return "translate(" + xtime(d[idx].date) + "," + y(d[idx].value) + ")"
			    }
			})

		})

	    var filtered_colors = colors.filter(function(c,i){
		if (datakeys[i-1]) {
		    return c
		}})
	    //var filtered_sensors =
	    var localprobedata = this.probedata
	    d3.select("#sensorbuttons").html("")
	    
	    var buttonsdiv = d3.select("#sensorbuttons")
		.selectAll("button")
		.data(short_sensor_names)
		.enter()
		.append("input")
		.attr("type","button")
		.attr("class","btn btn-sm sensorbtn ml-1 mt-3")
		.style('font-size', 'x-small')
		.style("background-color", "#f6f7f9")
		.style("border-radius", "13px")
	    	.attr("id", function (d,i){
		    return "text"+i
		})
		.attr("value", function (d,i){
		    let btext = ""
		    if (d.startsWith("T")) {
			btext = "Temp, °C "// #" + parNum
		    } else if (d.startsWith("C")) {
			btext = "CO2, ppm"// #" + parNum
		    } else if (d.startsWith("H")) {
			btext = "Humid, %"// # " + parNum
		    }

		    let button_text = " " + btext//fixedSens + " mod. #" + localprobedata[prb] + " "
		    return button_text

		})
		.on("mouseover", function () {
		    select(this)
			.style("background-color", "#1f6c39")
			//.style("color", "white")
		})
		.on("mouseout",  function() {
		    select(this)
			.style("background-color", "#f6f7f9")
			//.style("color", "#212529")
		})
	    	.on("click", (d,i) => {
		    var lineclass = ".line"+d//colorid
		    var textid = "#text"+i//colorid
		    var limitclass = ".line-"+d.toLowerCase()
		    
		    var selectedText = select(textid)
		    console.log("txt", selectedText, selectedText.style("color"))
		    var textColor = selectedText.style("color") == "lightgrey" ? "black" : 'lightgrey'
		    var selectedLines = selectAll(lineclass)
		    var limitLines = selectAll(limitclass)
		    
		    var linesOpacity = selectedLines.style("opacity") == 0 ? 1 : 0
		    var limitOpacity = limitLines.style("opacity") == 0 ? 0.3 : 0

		    var sensIndex = sensors_to_show.indexOf(d)

		    if (sensIndex >= 0) {
			sensors_to_show.splice(sensIndex, 1)
		    } else {
			sensors_to_show.push(d)
		    }
		    selectedLines
			.style("opacity", linesOpacity)
		    
		    limitLines
			.style("opacity", limitOpacity)
		    
		    selectedText.style("color", textColor)

		    var short_sensors = sensors_to_show.map(sd => {
			return sd[0]
		    })
		    console.log("show", short_sensors)
		    console.log("datakeys", datakeys)
		    var filtered_keys = []
		    datakeys.map( dk => {
			if (short_sensors.includes(dk[0])) {
			    filtered_keys.push(datakeys.indexOf(dk))
			}
		    })
		    console.log("fkeys", filtered_keys)
		    var filtered_data = filtered_keys.map( fk => {
			return plotdata[fk]
		    })
		    filtered_data = filtered_data.flat().flat()
		    filtered_data = filtered_data.map( fd => {
			return fd.value
		    })
		    var minmax = d3.extent(filtered_data)
		    
		    y.domain([minmax[0]-10, minmax[1]+10])
		    var leftAxis = svg.select(".axisLeft")
		    	.attr("transform", "translate(22," + this.svgHeight * 0.2 +")")
		    	.transition().duration(300).ease(easeLinear)
		    	.call(axisLeft(y)
			      .tickSize(-svgWidth, 0, 0)
			     )
		    leftAxis.selectAll(".tick line").attr("stroke", "lightgray").attr("stroke-dasharray", "1,4")
		    leftAxis.selectAll(".tick")
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
		    
		    l.y(d =>{
			return y(d.value)
		    })
		    
		    //svg.selectAll(".mainline")
		    svg.selectAll('.mainline')
			.transition()
			.duration(300)
			.ease(easeLinear)
			.attr("d", l)

		    
		    svg.selectAll('.limitline')
			.transition()
			.duration(300)
			.ease(easeLinear)
			.each(function(d,i) {
			    var ln  = select(this)
			    console.log("LINE", ln.attr("val"), ln.attr("val"),)
			    ln
				.attr("y1", y(ln.attr("val")))
				.attr("y2", y(ln.attr("val")))
			})
		})
	    
	    //var zoom = d3.zoom()
		//.scaleExtent([1, 30])
		//.translateExtent([[0, 0], [this.svgWidth, this.svgHeight]])
		//.extent([[0, 0], [this.svgWidth, this.svgHeight]])
		//.on("zoom", updateChart)
	    
	    //var margin = {top: this.svgHeight*0.2, right: 30, bottom: 30, left: 0}
	    
	    // append an invisible rect to svg to catch all pointer events
	    //svg.append("rect")
		//.attr("width", this.svgWidth)
		//.attr("height", this.svgHeight)
		//.style("fill", "none")
		//.style("pointer-events", "all")
		//.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
		//.call(zoom)
	    
	    //var svgHeight = this.svgHeight
	    //var svgWidth = this.svgWidth
	    
	    //function updateChart() {
		//var newX = d3.event.transform.rescaleX(xtime);
		//var newY = d3.event.transform.rescaleY(y);
		
		// update axes with these new boundaries
		//
		//xlabelstime.call(d3.axisBottom(newX)
		//		 .tickFormat(d3.timeFormat("%H:%M"))
		//		 .tickSize(-svgHeight, 0, 0)
		//		)
		//xlabelstime.selectAll(".tick line").attr("stroke", "lightgray").attr("stroke-dasharray", "1,4")
		//ylabels.call(d3.axisLeft(newY)
		//	     .tickSize(-svgWidth, 0, 0)
		//	    )
		//ylabels.selectAll(".tick line").attr("stroke", "lightgray").attr("stroke-dasharray", "1,4")
		// update lines position
		//var zoomedLine = l
		//    .x(function(d) {
		//	return newX(d.date)
		//    })
		//    .y(function(d) {
		//	return newY(d.value)
		 //   })
		
		//svg.selectAll("path.line")
		//    .attr("d",  function(d) {return zoomedLine(d)})
		
		//svg.selectAll("circle")
		//    .attr('cx', function(d) {return newX(d.date)})
		//    .attr('cy', function(d) {return newY(d.value)})
		
	    //}
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

      
</Style>
