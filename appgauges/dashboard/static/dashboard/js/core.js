/** Global namespace **/
var app = {};

/** Global debug flag **/
app.debug = true;

/** Log method **/
app.log = function() {
	if (app.debug && window.console && window.console.log && window.console.log.apply) {
		window.console.log(arguments);
	}
};

/** Core namespace **/
app.core = {
	init: function() {
		app.log('Starting the app');
		app.views.init();
		this.hideLoadScreen();
	},
	
	hideLoadScreen: function() {
		var loader = dojo.byId('loader');
		if (!loader) { return; }
		loader.style.display = 'none';
	}
};

/** Global DomReady **/
dojo.ready(function() {
	app.core.init();
});