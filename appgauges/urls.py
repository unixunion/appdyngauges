from django.conf.urls.defaults import patterns, include, url
from django.views.generic import TemplateView
import settings

from django.contrib import admin
admin.autodiscover()

if hasattr(settings, 'APPDYN_CONTROLLER'):
    APPDYN_CONTROLLER=settings.APPDYN_CONTROLLER
else:
    raise ImproperlyConfigured

urlpatterns = patterns('',
	url(r'^ipad$', 'dashboard.views.ipad', name='ipad'),
	url(r'^appdyn/(?P<path>.*)$', 'dashboard.views.proxy_to', {'target_url': APPDYN_CONTROLLER}),
	# admin views
	url(r'^admin/', include(admin.site.urls)),
)
if settings.DATABASE_MODE == True:
	print("Database mode")
	urlpatterns += patterns('',
		url(r'^$', 'dashboard.views.index', name='index'),
		url(r'^settings.js$', 'dashboard.views.settings', name='settings'),
		url(r'^views.js$', 'dashboard.views.views', name='views'),
		url(r'^(?P<path>.*)$', 'dashboard.views.proxy_to', {'target_url': APPDYN_CONTROLLER}),
	)
else:
		print("Static mode")
		urlpatterns += patterns('',
		url(r'^$', 'dashboard.views.indexStatic', name='index-static'),
		url(r'^settings.js$', RedirectView.as_view(url='/static/dashboard/js/settings.js')),
		url(r'^views.js$', RedirectView.as_view(url='/static/dashboard/js/views.js')),
		url(r'^(?P<path>.*)$', 'dashboard.views.proxy_to', {'target_url': APPDYN_CONTROLLER}),
    )
	
