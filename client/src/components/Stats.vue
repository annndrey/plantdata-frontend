<template>

<div class="mainpage">
  <div class="container">
    <div class="row">
      <div class="col-md-12">
	<div class="row">
	  <div class="col-md-12 text-left">
	    <h4> {{currentUser.company}}</h4>
	    
	    <greenhouse-nav @activeItemChanged="setActiveItem"></greenhouse-nav>
	    
	  </div>
	</div>

	
	<div class="row">
	  <div class="col-md-12">
	    <div class="card-deck">
	      
	      <div class="card">
		<div class="card-body">
		  <h5 class="card-title">Overall plants health</h5>
		  <p class="card-text">Chart here</p>
		</div>
	      </div>
	      
	      <div class="card">
		<div class="card-body">
		  <h5 class="card-title">Diseased zones discovered</h5>
		  <p class="card-text">Chart here</p>
		  <router-link class="btn btn-primary" :to="'/images/' + activeItem">Details [AI Images]</router-link>
		</div>
	      </div>
	      
	      <div class="card">
		<div class="card-body">
		  <h5 class="card-title">Unusual spikes of Sensors Data</h5>
		  <p class="card-text">Chart here</p>
		  <router-link class="btn btn-primary" :to="'/sensors/' + activeItem">Details [Sensors]</router-link>
		</div>
	      </div>
	      
	    </div>
	  </div>	
	</div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import GreenhouseNav from '@/components/GreenhouseNav'

export default {
    name: 'Stats',
    components: {
	GreenhouseNav
    },
    data: function() {
	return {
	    sensors: null,
	    activeItem: null,
 	}
    },
    created () {
    },
    computed: {
	...mapGetters({ currentUser: 'currentUser'})
    },
    filters: {
	moment_filter: function(date) {
	    let newdate = moment(date).utcOffset("+00:00").format("DD-MM-YYYY HH:mm")
	    return newdate
	}
    },
    methods: {
	setActiveItem(value) {
	    console.log(value)
	    this.activeItem = value
	}
    }

}
</script>


<style >
  .fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to {
  opacity: 0;
  }
  span.error{
  color:#e74c3c;
  font-size:20px;
  display:flex;
  justify-content:center;
  }
  .blank_row
  .statusmessage {
  height: 22px !important; 
  }
  h3 {
  margin: 40px 0 0;
  }
  ul {
  list-style-type: none;
  padding: 0;
  }
  li {
  display: inline-block;
  margin: 0 10px;
  }
  a {
  color: #7fd76b;
  }
  a:hover {
      color:white;
  }
  a.active {
      color:white;
   }
   
  .loading {
      position: fixed;
      top: 50%;
      left: 45%;
      z-index: 30001;
      -webkit-animation:spin 2s linear infinite;
      -moz-animation:spin 2s linear infinite;
      animation:spin 2s linear infinite;
  }
  @-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } }
  @-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }
  @keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }
  
</style>
