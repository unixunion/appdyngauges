app.widget = app.widget || {};

app.widget.Jira = function(id, settings ) {
	if (!id) { return; }
	
	var defaultValues = {
		title: 'Jira',
		updateInterval: 60000,
	};
	
	settings = dojo.mixin(defaultValues, settings);
	
	this.id = id;
	this.timer = null;
	this.logPrefix = 'Widget.Jira ' + this.id + ':';
	this.url = settings.urls.jira;
	this.title = settings.title;
	this.updateInterval = settings.updateInterval;
	this.rendered = false;
	this.init();
};

app.widget.Jira.prototype = {	
	init: function() {
		app.log('New Widget.Jira created', this);
		//this.showLoader();
		this.getData();
		this.setUpdateInterval();
	},
	
	showLoader: function() {
		dojo.byId(this.id).innerHTML = '<li>Fetching Results<div class="loader-icon"></div></li>';
	},

	getData: function() {
		var _this = this,
			result;
			  dojo.xhrGet({
				  // The URL of the request
				  url: this.url,
				  handleAs: "json",
				  load: function(jsonData) {
					  app.log(_this.logPrefix + 'Ajax call was successful: ', jsonData);
					  var content = "";
					  dojo.forEach(jsonData.issues,function(issue) {
						  app.log(_this.logPrefix + 'json data ' + issue);
						  content += '<li data-dojo-type="dojox.mobile.ListItem" class="mblListItem">' + issue.key + '</li>';
					  });
					  app.log(_this.logPrefix + 'New value: ', _this.value);
					  dojo.byId(_this.id).innerHTML = content;
				  },
				  // The error handler
				  error: function() {
					  dojo.byId(_this.id).innerHTML = "Error reading issues."
					},
			  });

	},
   
	setUpdateInterval: function() {
		var _this = this;
		
		this.timer = new dojox.timing.Timer(this.updateInterval);
		this.timer.onTick = function(){
			_this.getData();
		};
		this.timer.start();
	},
	
	destroy: function() {
		app.log('YOOO: ', this.id, dojo.byId(this.id));		
		dojo.byId(this.id).innerHTML = '';
	}
};
