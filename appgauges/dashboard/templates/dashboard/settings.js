/** Settings namespace **/
app.settings = {};

/** Default settings, should be produced by a backend call to Django **/
app.settings.default = {
	calculatePercentages: false,
	locale: 'en_GB',
	urls: {
		map: '/static/dashboard/mocks/EuropeMap.json',
      mapMarkers: '/static/dashboard/mocks/EuropeMarkers.json',
      mapData: '/static/dashboard/mocks/EuropeDataStore.json',
		/** Gauges passed to this template render **/
		{% for gauge in gauges %}
			{{gauge.name}}: '{{gauge.cleanUrl}}',
		{% endfor %}
	}
};

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
