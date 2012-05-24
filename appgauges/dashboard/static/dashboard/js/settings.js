/** Settings namespace **/
app.settings = {};

/** Default settings, should be produced by a backend call to Django **/
app.settings.default = {
	calculatePercentages: false,
	locale: 'en_GB',
	urls: {
		// Map layout
		map: '/static/dashboard/mocks/EuropeMap.json',
      mapMarkers: '/static/dashboard/mocks/EuropeMarkers.json',
      mapData: '/static/dashboard/mocks/EuropeDataStore.json',
		// Gauges, any gauge you create here will be referenced in views.js / widget-map.js
		avgResponse: '/appdyn/controller/rest/applications/MYAPP/metric-data?metric-path=Overall%20Application%20Performance%7CAverage%20Response%20Time%20(ms)&time-range-type=BEFORE_NOW&duration-in-mins=15&output=JSON',
		avgCps: '/appdyn/controller/rest/applications/MYAPP/metric-data?metric-path=Overall%20Application%20Performance%7CCalls%20per%20Minute&time-range-type=BEFORE_NOW&duration-in-mins=15&output=JSON',
		avgStallCount: '/appdyn/controller/rest/applications/MYAPP/metric-data?metric-path=Overall%20Application%20Performance%7CStall%20Count&time-range-type=BEFORE_NOW&duration-in-mins=15&output=JSON',
		avgErrors: '/appdyn/controller/rest/applications/MYAPP/metric-data?metric-path=Overall%20Application%20Performance%7CErrors%20per%20Minute&time-range-type=BEFORE_NOW&duration-in-mins=15&output=JSON',
		Poland_Errors: '/appdyn/controller/rest/applications/MYAPP/metric-data?metric-path=Overall%20Application%20Performance%7CErrors%20per%20Minute&time-range-type=BEFORE_NOW&duration-in-mins=15&output=JSON',
		Sweden_Errors: '/appdyn/controller/rest/applications/MYAPP/metric-data?metric-path=Overall%20Application%20Performance%7CErrors%20per%20Minute&time-range-type=BEFORE_NOW&duration-in-mins=15&output=JSON',
		Belgium_Errors: '/appdyn/controller/rest/applications/MYAPP/metric-data?metric-path=Overall%20Application%20Performance%7CErrors%20per%20Minute&time-range-type=BEFORE_NOW&duration-in-mins=15&output=JSON',
	}
};

/** Local URL hack for development **/
//app.settings.default.urls.logins = '/static/ipad/mocks/logins.json';
//app.settings.default.urls.latency = '/static/ipad/mocks/latency.json';
//app.settings.default.urls.deposits = '/static/ipad/mocks/deposits.json';
//app.settings.default.urls.jira = '/static/ipad/mocks/jira.json';

/** User settings **/
app.settings.user = {
	locale: 'en_UK'
};

/** Saves user settings **/
app.settings.update = function(key, value) {
	app.settings.user[key] = value;
	app.settings.save();
	app.log('Updated settings: ', key, value);
};

/** Saves user settings **/
app.settings.save = function() {
	if ('localStorage' in window && window['localStorage'] !== null) {
		window.localStorage.setItem('userSettings', JSON.stringify(app.settings.user));
	}
};

/** Returns settings **/
app.settings.get = function() {
	var stored;
	if ('localStorage' in window && window['localStorage'] !== null) {
		stored = window.localStorage.getItem('userSettings');
		app.settings.user = (stored) ?  JSON.parse(stored) : app.settings.user;
	}
	return dojo.mixin(app.settings.default, app.settings.user);
};
