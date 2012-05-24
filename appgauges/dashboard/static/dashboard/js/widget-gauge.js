app.widget = app.widget || {};

app.widget.Gauge = function(id, settings) {
	if (!id) { return; }
	
	var defaultValues = {
		max: 500,
		size: 200,
		title: 'Gauge',
		updateInterval: 60000,
		updateMargin: 5000,
		calculatePercentages: true
	};
	
	settings = dojo.mixin(defaultValues, settings);
	
	this.id = id;
	this.timer = null;
	this.value = 0;
	this.logPrefix = 'Widget.Gauge ' + this.id + ':';
	this.url = settings.url;
	this.max = settings.max;
	this.size = settings.size;
	this.title = settings.title;
	this.mockmode = false;
	this.calculatePercentages = settings.calculatePercentages;
	this.updateInterval = settings.updateInterval;
	this.updateMargin = settings.updateMargin;
	this.rendered = false;
	this.init();
};

app.widget.Gauge.prototype = {	
	init: function() {
		app.log('New Widget.Gauge created', this);
		//this.showLoader();
		if ( this.mockmode ) {
			this.getMock();
		} else {
			this.getData();
		}
		this.setUpdateInterval();
	},
	
	showLoader: function() {
		dojo.byId(this.id).innerHTML = '<div class="loader-icon"></div>';
	},
	
	getData: function() {
		var _this = this,
			result;
		
		dojo.xhrGet({
			url: this.url,
			handleAs: "text",
			
			load: function(data) {
				app.log(_this.logPrefix + 'Ajax call was successful: ', data);
				_this.value = JSON.parse(data)[0]['metricValues'][0]['value'];
				if ( _this.value > _this.max ) {
					_this.max = _this.value + 100;
				}
				app.log(_this.logPrefix + 'New value: ', _this.value);
				
				if (!_this.rendered) {
					_this.render();
					_this.rendered = true;
				} else {
					_this.redraw();
				}
			},
			
			error: function() {
				dojo.byId(_this.id).innerHTML = 'An error occured';
			},
			
			preventCache: true
		});
	},

   getMock: function() {
		var _this = this;
		app.log("getMock");
		_this.value = Math.floor(Math.random()*600);
		if (!_this.rendered) {
			_this.render();
			_this.rendered = true;
		} else {
			_this.redraw();
		}
	},
	
	setUpdateInterval: function() {
		var _this = this;
		this.timer = new dojox.timing.Timer(this.updateInterval + Math.floor(Math.random(this.updateMargin)));
		this.timer.onTick = function(){
			if (_this.mockmode) {
				_this.getMock();
			} else {
				_this.getData();
			}
		};
		this.timer.start();
	},
	
	render: function() {
		var settings = {
			background: [255, 255, 255, 0],
			title: this.title,
			id: this.id,
			width: this.size,
			height: this.size,			
			noChange: 'true',
			font: 'normal normal normal ' + this.size/20 + 'pt sans-serif',
			textIndicatorFont: 'normal normal normal ' + this.size/10 + 'pt sans-serif',
			textIndicatorVisible: 'true'
		};
		
		settings = dojo.mixin(settings, this.getSettings());
		app.log('Creating Gauge with settings: ', settings);
		app.log('Creating Gauge this: ', this);
		this.gauge = new dojox.gauges.GlossyCircularGauge(settings, dojo.byId(this.id));				
		app.log('calling gauge startup:', this);
		this.gauge.startup();
		app.log('gauge startup called:', this);
		
	},
	
	getSettings: function() {
		var settings = {},
			colorIntervals = {},
			colors = {
				green: '#12B300',
				yellow: '#F7CE16',
				red: '#ff0000'
			};

		function roundTo(number, to) {
    		return Math.round(number * to) / to;
		}
		
		if (this.calculatePercentages) {
			settings.value =  Math.round(this.value / this.max * 100);;
			settings.max = 100;
			settings.majorTicksInterval = 10;
			settings.minorTicksInterval = 5;
			colorIntervals.yellowFrom = 75;
			colorIntervals.redFrom = 85;
		} else {
			settings.value = this.value;
			settings.max = this.max;
			settings.majorTicksInterval = Math.round(this.max/8);
			settings.minorTicksInterval = Math.round(this.max/4);
			colorIntervals.yellowFrom = 0.75 * this.max;
			colorIntervals.redFrom = 0.85 * this.max;
		}
		
		if (settings.value > colorIntervals.redFrom) {
			settings.needleColor = colors.red;
		} else if (settings.value > colorIntervals.yellowFrom) {
			settings.needleColor = colors.yellow;
		} else {
			settings.needleColor = colors.green;
		}
		
		return settings;
	},
	
	redraw: function() {
		var settings = this.getSettings();
		for (setting in settings) {
            if (settings.hasOwnProperty(setting)) {
				this.gauge.set(setting, settings[setting]);
            }
        }
	},
	
	destroy: function() {
		dojo.byId(this.id).innerHTML = '';
		this.gauge.destroy(true);
	}
};
