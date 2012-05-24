//dojo.require('dojox.geo.charting.Map');
dojo.require('dojox.geo.charting.widget.Map');
dojo.require('dojo.data.ItemFileWriteStore');
dojo.requireIf(dojo.isIos, 'dojox.geo.charting.TouchInteractionSupport');
dojo.requireIf(!dojo.isIos, 'dojox.geo.charting.MouseInteractionSupport');
dojo.require('dojox.geo.charting.KeyboardInteractionSupport');

app.widget = app.widget || {};

app.widget.Map = function(id, settings) {
    if (!id || !settings) {
        return;
    }
	 this.gauges = [];
    this.id = id;
    this.mapDataUrl = settings.mapDataUrl;
    this.markerDataUrl = settings.markerDataUrl;
    this.dataUrl = settings.dataUrl;
    this.isTouchDevice = dojo.isIos || (navigator.userAgent.toLowerCase().indexOf('android') > -1);
    this.init();
};

app.widget.Map.prototype = {
    init: function() {
        app.log('New Widget.Map created', this);
        //	this.showLoader();
        try {
            this.initMap();
        } catch(e) {
        	app.log('Error ', e);
        }
    },

    showLoader: function() {
        dojo.query('#' + this.id).innerHTML('<div class="loader-icon"></div>');
    },

	 destroyGauges: function() {
      var i = 0, l = this.gauges.length;

      app.log('Unload gaguges', l);
      for (; i < l; i++) {
         this.gauges[i].destroy();
         app.log(this.gauges[i]);
         this.gauges[i] = null;
      }
      this.gauges = [];
   },

    initMap: function() {
        var _this = this;

        var dataStore = new dojo.data.ItemFileWriteStore({
            url: this.dataUrl
        });

        app.log('dataStore', dataStore);

		this.map = new dojox.geo.charting.widget.Map({
			shapeData: this.mapDataUrl,
			markerData: this.markerDataUrl,
			animateOnResize: false,
			adjustMapCenterOnResize: true,
			adjustMapScaleOnResize: true,
			enableFeatureZoom: true,
			showTooltips: true,
			colorAnimationDuration: 300,
			enableMouseSupport: !this.isTouchDevice,
			enableMousePan: !this.isTouchDevice,
			enableMouseZoom: !this.isTouchDevice,
			enableTouchSupport: this.isTouchDevice,
			onFeatureClick: function (feature) {
				if (!feature) {
					return;
				}
				//app.log('You clicked ', feature, feature.mapObj.marker.markerData, feature.mapObj.marker.markerData[feature.id]);
                _this.populateLegend(feature.mapObj.marker.markerData[feature.id] || 'Unknown');
			},
            dataStore: dataStore,
            dataBindingAttribute: {
                product: "A"
            },
            series: {
                "series": [{
                    name: "Low sales state(0~$3.0M)",
                    min: "0.0",
                    max: "3.0",
                    color: "#FFCE52"
                },
                {
                    name: "Normal sales state($3.0M~$6.0M)",
                    min: "3.0",
                    max: "6.0",
                    color: "#63A584"
                },
                {
                    name: "High sales state($6.0M~$10.0M)",
                    min: "6.0",
                    max: "9.0",
                    color: "#CE6342"
                }]
            },
            dataBindingValueFunction: function() {
                //console.log('Bind?', arguments);
            }
		}, this.id);

        /*
        this.map.addSeries({
            "series": [{
                name: "Low sales state(0~$3.0M)",
                min: "0.0",
                max: "3.0",
                color: "#FFCE52"
            },
            {
                name: "Normal sales state($3.0M~$6.0M)",
                min: "3.0",
                max: "6.0",
                color: "#63A584"
            },
            {
                name: "High sales state($6.0M~$10.0M)",
                min: "6.0",
                max: "9.0",
                color: "#CE6342"
            }]
        });*/
		this.map.getInnerMap().defaultColor = '#000000';

		app.log('We have a map!', this.map);
    },

    populateLegend: function(country) {
		//  var _this = this, result;
		app.log('populating legend called:', this);
		this.destroyGauges();

			// Create gauge objects
      var _this = this, settings = app.settings.get(),
         gauges = [
            {
               //id: [country + '_avgresponse_gauge'],
               id: 'avgStallCount',
					url: settings.urls.avgStallCount, /**[country + '_Errors'],*//
               //url: settings.urls.avgResponse,
               calculatePercentages: settings.calculatePercentages,
               max: 600,
               size: 200,
               label: 'Avg StallCount'
            },
         ], gauge, i = 0, l = gauges.length;

		
      if ( settings.urls[country + '_Errors'] ) {
         app.log('found a valid settings.url for country');
      	for (; i < l; i++) {
	         gauge = new app.widget.Gauge(gauges[i].id, gauges[i]);
				app.log('pushing gauges ' , this);
	         _this.gauges.push(gauge);
	      }
      } else {
         app.log('no valid settings.url found for country');
      }



		  //_this.value=0;
		  //app.log('get legend country:', country);
        if (!this.legend) {
            this.legend = dojo.byId('map-legend');
        }
        
        var val = '',
            max = 600;

		  try {
				val = '<p class="headline"><strong>';
		      val += country;
        		val += ' Error Rate:</strong> ';
				//val += '<div class="gauge" id="' + [country + '_avgresponse_gauge'] +'"><div class="loader-icon"></div></div>'
				val += '<div class="gauge" id="myavgresponse_gauge"></div>'
        		val += '</p>';
        		_this.legend.innerHTML = val;
        		_this.legend.style.display = 'block';
		} catch(error) {
			app.log('unconf error');
			val = '<p class="headline">';
			val += country;
			val += '</p>';
			val += '<ul>';
         val += '<li>';
         val += '<strong>unconf error</strong>';
			val += '</li>';
         val += '<li>';
			val += '</ul>';
			_this.legend.innerHTML = val;
			_this.legend.style.display = 'block';
		}

		/*
        val = '<p class="headline">';
        val += country;
        val += '</p>';
        val += '<ul>';
        val += '<li>';
        val += '<strong>Login Rate:</strong> ';
        val += _this.value;
        val += '</li>';
        val += '<li>';
        val += '<strong>Transactions Rate:</strong> ';
        val +=  Math.floor((Math.random()* 500)+1);
        val += '</li>';
        val += '<li>';
        val += '<strong>Streams:</strong> ';
        val +=  Math.floor((Math.random()* 30000)+1);
        val += '</li>';
        val += '</ul>';
        this.legend.innerHTML = val;
        this.legend.style.display = 'block';
		*/
    },

    getData: function(id) {
        var data = {

        };

        return data[id] || {};
    },


    destroy: function() {
        //dojo.query('#' + this.id).innerHTML('');
        // Destroy the dojox widget here?
    	var parent = dojo.query('#' + this.id).parent();
		this.destroyGauges();
		legend = dojo.byId('map-legend');
		legend.innerHTML = '';
		legend.style.display = 'none';
    	this.map.destroy();
    	parent.innerHTML('<div id="' + this.id + '" style="height:768px;width:100%;"></div>');
    }

};
