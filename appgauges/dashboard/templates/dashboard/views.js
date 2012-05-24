/** View handler **/
app.views = {
	current: null,

	init: function () {
		this.subscribeToEvents();
	},

	setCurrent: function (view) {
		this.current = view;
		app.log('Setting current view to: ', view);
	},

	subscribeToEvents: function () {
		var _this = this;

		// Subscribe to the start view event
		dojo.subscribe('/dojox/mobile/startView', function (view, moveTo, dir, transition, context, method) {
			app.log('Event: startView', view);
			_this.loadView(view.id);
		});

		// Subscribe to the view change event
		dojo.subscribe('/dojox/mobile/beforeTransitionIn', function (view, moveTo, dir, transition, context, method) {
			app.log('Event: viewChange', view);
			_this.loadView(view.id);
		});
	},

	loadView: function (view) {
		if (this.current) {
			this.unloadView(this.current);
		}

		if (!app.view[view]) {
			app.log('loadView: No view found with id: ', view);
			return;
		}

		this.setCurrent(view);
		app.view[view].load();
	},

	unloadView: function (view) {
		if (!app.view[view]) {
			app.log('unloadView: No view found with id: ', view);
			return;
		}

		app.view[view].unload();
	}
};

/** View namespace **/
app.view = {};

/** Dashboard view **/
app.view.overview = {
	gauges: [],
	jiras: null,
	events: null,

	load: function () {
		this.createGauges();
		//this.getJiras();
		//this.getEvents();
	},

	createGauges: function () {
		var _this = this,
			settings = app.settings.get(),
			// Gauges displayed in the "overview" page. please set the URL to something that is configured in settings.js
			gauges = [
				{% for gauge in gauges %}
				{
					id: '{{gauge.name}}',
					url: settings.urls.{{gauge.name}},
					calculatePercentages: settings.calculatePercentages,
					max: {{gauge.maximum}},
					size: 200,
					label: '{{gauge.name}}'
				},
				{% endfor %}
			], gauge, i = 0, l = gauges.length;

		for (; i < l; i++) {
			gauge = new app.widget.Gauge(gauges[i].id, gauges[i]);
			this.gauges.push(gauge);
		}

		if (!this.filterButton) {
			this.filterButton = dijit.byId('applyGaugeFiltersButton');
			this.filterWrapper = dijit.byId('filter-spinwheel');

			dojo.connect(this.filterButton, 'onClick', function() {
				var filters = ['market', 'brand', 'product', 'channel'],
					i, l,
					filter, display;

				for (i = 0, l = filters.length; i<l; i++) {
					filter = dijit.byId('filter-' + filters[i]);
					display = dojo.byId('filter-' + filters[i] + '-display');
					display.innerHTML = filter.getValue();
				}

				_this.destroyGauges();
				_this.createGauges();
			});
		}
	},

	getJiras: function() {
		var settings = app.settings.get(), customSettings = {
			limit: 5
		};
		settings = dojo.mixin(settings, customSettings);
		this.jiras = new app.widget.Jira('overviewJiras', settings);
	},

	getEvents: function() {
		var settings = app.settings.get(), customSettings = {
			limit: 5
		};
		settings = dojo.mixin(settings, customSettings);
		this.events = new app.widget.Events('overviewEvents', settings);
	},

	unload: function () {
		this.destroyGauges();
		//this.jiras.destroy();
		//this.events.destroy();
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
	}
};

/** map view **/
app.view.map = {
	mapWidget: null,
	gauges: [],
	load: function () {
		app.log('Load the map-widget');
		this.gauges = [];
		app.log(dijit.byId('map-header'), dijit.byId('navigation'));

		var bodyHeight = dojo.marginBox(document.getElementsByTagName('body')[0]) || {h: 0},
			headHeight = dojo.marginBox(dijit.byId('map-header').domNode) || {h: 0},
			navHeight = dojo.marginBox(dijit.byId('navigation').domNode) || {h: 0},
			containerHeight = bodyHeight - (headHeight + navHeight);

		app.log('SIZE?', containerHeight, bodyHeight, headHeight, navHeight);

		this.mapWidget = new app.widget.Map('map-container', {
			gauges: [],
			mapDataUrl: app.settings.get().urls.map,
			markerDataUrl: app.settings.get().urls.mapMarkers,
         dataUrl: app.settings.get().urls.mapData
		});
	},

	unload: function () {
		app.log('Unload the map-widget');
		this.mapWidget.destroy();
	}

};

/** events view **/
app.view.events = {
    eventsAll: null,
    load: function () {
        this.getIssues();
    },

    getIssues: function () {
        var settings, customSettings;

        //Archive
        settings = app.settings.get();
        customSettings = {
            limit: 12
        };
        settings = dojo.mixin(settings, customSettings);
        this.eventsAll = new app.widget.Events('eventsAll', settings);

        //Top 3
        settings = app.settings.get();
        customSettings = {
            limit: 3
        };
        settings = dojo.mixin(settings, customSettings);
        this.eventsTop3 = new app.widget.Events('eventsTop3', settings);
    },

    unload: function () {
        app.log('unload');
        this.eventsAll.destroy();
        this.eventsTop3.destroy();
    }
};

/** events details view **/
app.view.eventDetails = {
    eventDetails: null,
    load: function () {
        this.getIssues();
    },

    getIssues: function () {
        var settings, customSettings;

        //Archive
        settings = app.settings.get();
        customSettings = {
            limit: 1
        };
        settings = dojo.mixin(settings, customSettings);
        this.eventDetails = new app.widget.EventDetails('eventDetails', settings);
    },

    unload: function () {
        app.log('unload');
        this.eventDetails.destroy();
    }
};

/** jira view **/
app.view.jira = {
	allissues: null,
	load: function () {
		this.getIssues();
	},

	getIssues: function () {
		var settings, customSettings;

		//Archive
		settings = app.settings.get();
		customSettings = {
			limit: 30
		};
		settings = dojo.mixin(settings, customSettings);
		this.allissues = new app.widget.Jira('jiraAllIssues', settings);
	},

	unload: function () {
		app.log('unload');
		this.allissues.destroy();
	}

};

/** Settings view **/
app.view.settings = {
	behavioursSet: false,

	load: function () {
		if (!this.behavioursSet) {
			this.setBehaviours();
			this.behavioursSet = true;
		}
	},

	unload: function () {
		// Not needed, re-bind is more expensive
	},

	setBehaviours: function () {
		dojo.connect(dijit.byId('swx'), 'onStateChanged', function (newState) {
			app.log('newState: ', newState);
			app.settings.update('calculatePercentages', (newState == 'on'));
		});

		dojo.connect(dijit.byId("swx_logins"), "onStateChanged", function (newState) {
			console.log('swx_logins toggled: ' + newState);
			if (newState == 'on') {
				newState = false;
			} else {
				newState = true;
			}
			logins_hidden = newState;
			console.log('swx_logins toggled: ' + logins_hidden);
			gauge = dijit.byId("obj_logins_gauge");
			gauge.domNode.hidden = logins_hidden;
			gauget = dojo.byId("obj_logins_title");
			gauget.hidden = logins_hidden;
		});
	}
};
