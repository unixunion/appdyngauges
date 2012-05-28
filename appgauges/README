Appdynamics + Dojo Glossy Gauges Demo
================================
Kegan Holtzhausen

Overview
-------------------------
This is a simple POC JavaScript webapp embedded into a django application server
This django server delivers an iOS app-like webapp featuring views and gauges for 
data that you might want to visualize in this way.

If the app is bookmarked to iOS home screen it can be used just like any iOS app.

The gauges are dojox gauges loaded via a custom JS widget which equips the gauges
with self-updating timers.

Gauges are added via django admin interface. 

Tested on:
	Debian
	Python 2.7
	Django 1.3.1

Requires
-------------------------
	django-1.3.1
	python-urllib2

Installation
-------------------------
	Unpack to /opt/appgauges
	Customize settings.py and correct APPDYN_* variables and paths to static content if not in /opt/appgauges
	Configure database ( sqlite is fine ) in settings.py
	init db: python manage.py syncdb
	import testdata: python manage.py loaddata fixtures/dashboard.json

Running
-------------------------
	Start dev server:
		python manage.py runserver 0.0.0.0:8000
	Customize gauge REST URLs:
		http://SERVERIP:8000/admin/
	To customize the example map view:
		By default map view only shows gauges names {{COUNTRY}}_Error, to change this,
		adjust names of URL variables if not in the form of {{COUNTRY}}_Error in
		dashboard/static/dashboard/js/widget-map.js
	Access Dashboard via:
		http://SERVERIP:8000/

Static vs Database Mode
-------------------------
	The default configuration uses django template engine to insert gauges into settings.js and views.js which are
	within dashboard/templates/dashboard. If you want to run with static gauges coded right into the js pages and 
	skip the databse, you need to customize the JS files in dashboard/static/dashboard/js/ *
	To Enable Static Mode:
		set DATABASEMODE in settings.py to False
		add gauges in dashboard/static/dashboard/js/settings.js 
		reference settings.js gauges in dashboard/static/dashboard/js/views.js
		reference gauges in dashboard/templates/dashboard/index-static.html

Known Issues
-------------------------
	Dojo 1.7.2 has a memory leak bug for the gauge objects in the form of SVG data which is not cleaned up when the 
	gauge updates. see: http://bugs.dojotoolkit.org/ticket/12847

	This means that your gauge update frequency and count will cause your browser to accumulate heap over time. 
	Configuring gauges to update less frequently is better. However you will eventually have to reload the page 
	to purge unreleased memory. add a hourly metatag to page refresh in header if you need it.
