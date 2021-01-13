<template>
  <nav class="navbar navbar-expand-sm navbar-details">
    <ul class="navbar-nav mr-auto">
      <li class="nav-item">
	<button type="button" class="btn btn-primary widgetButton" :class="{ activeButton: activeItem == 'barchart'}" @click="setActive('barchart')">
	  <svg width="0.8em" height="0.8em" viewBox="0 0 16 16" class="bi bi-bar-chart-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
	    <rect width="4" height="5" x="1" y="10" rx="1"/>
	    <rect width="4" height="9" x="6" y="6" rx="1"/>
	    <rect width="4" height="14" x="11" y="1" rx="1"/>
	  </svg>
	</button>
      </li> 
      <li class="nav-item" v-if="parent == 'sensors'">
	<button type="button" class="btn btn-primary widgetButton" :class="{ activeButton: activeItem == '3d'}" @click="setActive('3d')">
	  3d-view
	  <svg width="0.8em" height="0.8em" viewBox="0 0 16 16" class="bi bi-layers-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
	    <path fill-rule="evenodd" d="M7.765 1.559a.5.5 0 0 1 .47 0l7.5 4a.5.5 0 0 1 0 .882l-7.5 4a.5.5 0 0 1-.47 0l-7.5-4a.5.5 0 0 1 0-.882l7.5-4z"/>
	    <path fill-rule="evenodd" d="M2.125 8.567l-1.86.992a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882l-1.86-.992-5.17 2.756a1.5 1.5 0 0 1-1.41 0l.418-.785-.419.785-5.169-2.756z"/>
	  </svg>
	</button>
      </li>
      <li class="nav-item">
	<button type="button" class="btn btn-primary widgetButton" :class="{ activeButton: activeItem == 'flag'}" @click="setActive('flag')">
	  <svg width="0.8em" height="0.8em" viewBox="0 0 16 16" class="bi bi-flag-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
	    <path fill-rule="evenodd" d="M3.5 1a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-1 0v-13a.5.5 0 0 1 .5-.5z"/>
	    <path fill-rule="evenodd" d="M3.762 2.558C4.735 1.909 5.348 1.5 6.5 1.5c.653 0 1.139.325 1.495.562l.032.022c.391.26.646.416.973.416.168 0 .356-.042.587-.126a8.89 8.89 0 0 0 .593-.25c.058-.027.117-.053.18-.08.57-.255 1.278-.544 2.14-.544a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5c-.638 0-1.18.21-1.734.457l-.159.07c-.22.1-.453.205-.678.287A2.719 2.719 0 0 1 9 9.5c-.653 0-1.139-.325-1.495-.562l-.032-.022c-.391-.26-.646-.416-.973-.416-.833 0-1.218.246-2.223.916A.5.5 0 0 1 3.5 9V3a.5.5 0 0 1 .223-.416l.04-.026z"/>
	  </svg>
	</button>
      </li>
    </ul>
    
    <!--<ul class="navbar-nav mx-auto justify-content-center">
      <li class="nav-item">
	<button type="button" class="btn widgetButton">
	  <svg width="0.8em" height="0.8em" viewBox="0 0 16 16" class="bi bi-calendar" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
	    <path fill-rule="evenodd" d="M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1zm1-3a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H2z"/>
	    <path fill-rule="evenodd" d="M3.5 0a.5.5 0 0 1 .5.5V1a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 .5-.5zm9 0a.5.5 0 0 1 .5.5V1a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 .5-.5z"/>
	  </svg>
	</button>
      </li>
    </ul>
    -->
    
    <ul class="navbar-nav ml-auto">
      <li class="nav-item">
	<button type="button" :disabled="!plotdata" class="btn btn-primary widgetButton" @click="exportData()">
	  <svg width="0.8em" height="0.8em" viewBox="0 0 16 16" class="bi bi-download" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
	    <path fill-rule="evenodd" d="M.5 8a.5.5 0 0 1 .5.5V12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.5a.5.5 0 0 1 1 0V12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V8.5A.5.5 0 0 1 .5 8z"/>
	    <path fill-rule="evenodd" d="M5 7.5a.5.5 0 0 1 .707 0L8 9.793 10.293 7.5a.5.5 0 1 1 .707.707l-2.646 2.647a.5.5 0 0 1-.708 0L5 8.207A.5.5 0 0 1 5 7.5z"/>
	    <path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0v-8A.5.5 0 0 1 8 1z"/>
	  </svg>
	</button>
      </li>
    </ul>
  </nav>
</template>

<script>
import { mapGetters } from 'vuex'
import XLSX from 'xlsx';
export default {
    name: 'WidgetNav',
    props: {'parent': String,
	    'plotdata': Array,
	    'probedata': Array,
	   },
    data () {
	return {
	    activeItem: 'barchart',
	    daterange: {'start': new Date(), 'end': new Date()},
	    currentdate: null,
	}
    },
    computed: {
	...mapGetters({ currentUser: 'currentUser'})
    },    
    created () {
	this.setActive('barchart')
    },
    mounted() {
    },
    updated () {
    },
    watch: {
	plotdata: function(newVal, oldVal) { 
	    console.log("plotdata changed")
        },
	probedata: function(newVal, oldVal) {
	    console.log("probedata changed")
	}
    },
    methods: {
	exportData() {
	    console.log("exportData")
	    var json_data = []
	    
	    //let csv = 'Sensor,Type,Date,Value\n'
	    
	    for (const [key, value] of Object.entries(this.probedata)) {
		//console.log(key, value)
		
		// date labels
		let datelabels = null
		
		for (const [lk, lv] of Object.entries(this.plotdata.probelabels)) {
		    if (lk.startsWith(key)) {
			datelabels = lv
			
		    }
		}
		for (const [dk, dv] of Object.entries(this.plotdata.data)) {
		    let kparts = dk.split(" ")
		    if (kparts[1].startsWith(key)) {
			//console.log("Sens. " + value)
			
			//console.log(dk, dv)
			dv.map((d,ind) => {
			    let rowdate = datelabels[ind]
			    if (rowdate) {
				let row = {"Sensor": "Sensor " + value, "Type": kparts[0], "Date": rowdate, "Value": dv[ind]}
				json_data.push(row)
			    }
			})
		    }
		}
	    }
	    const data = XLSX.utils.json_to_sheet(json_data)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, data, 'data')
            XLSX.writeFile(wb, 'exported_data.xlsx')
	    //xlsxWriter.insertSheet(xlsxSheet)
	    //document.getElementById('fileExport').addEventListener('click', function () {            
              //  xlsxWriter.saveFile(); // pop! ("Save As" dialog appears)
            //})
	    //console.log("writer", xlsxWriter)
	    //let anchor = document.createElement('a')
	    //anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
	    //anchor.target = '_blank'
	    //anchor.download = 'exported_data.csv'
	    //anchor.click()
	},
	showDate(date) {
	    return this.$moment(date).format('DD/MM/YYYY')
	},
	dateFormat() {
	    if (this.showDate(this.daterange.start) == this.showDate(Date()) && this.showDate(this.daterange.end) == this.showDate(Date())) {
		return "today"
	    } else if (this.showDate(this.daterange.start) == this.showDate(this.daterange.end)) {
		return  this.showDate(this.daterange.start)
	    } else {
		return this.showDate(this.daterange.start) + " - " + this.showDate(this.daterange.end)
	    }
	},
	setActive(button_name) {
	    let outData = {}
	    outData.activeItem = button_name
	    this.activeItem = button_name
	    this.$emit('activeItemChanged', outData)
	},
	setData(what, request) {
	    if (what == "sensors") {
		this.sensors = request.data
	    } 	    
	}
	
    }
}

</script>

<style>
.card-white {
    background-color: transparent;
    border-color: transparent;
}
.btn-white {
    color: black;
    background-color: white;
    border-color: white;
}
.content {
    position: relative;
  }

#collapseDate {
    position: absolute;
    z-index: 1;
    right: -135px;
}
.navbar-details {
    background: #f6f7f9 !important;
    color: black !important;
  }
.btn.widgetButton {
    color: #1f6c39;
    background-color: white;
    border-color: transparent;
    font-size: 1em;
}
.btn.widgetButton:hover {
    color: white;
    background-color: #1f6c39;
    border-color: transparent;
}
.btn.widgetButton.activeButton {
    color: white;
    background-color: #1f6c39;
}
</style>
