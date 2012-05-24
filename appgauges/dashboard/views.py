# Create your views here.
from django.shortcuts import render_to_response, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect
from django.core import serializers
from django.shortcuts import get_list_or_404
from django.views.decorators.cache import cache_page
from django.utils.encoding import iri_to_uri
import settings
import os
from django.template.response import TemplateResponse

# models
from models import Tag, Gauge

if hasattr(settings, 'APPDYN_CONTROLLER'):
    APPDYN_CONTROLLER=settings.APPDYN_CONTROLLER
else:
    raise ImproperlyConfigured

if hasattr(settings, 'APPDYN_USERNAME'):
    APPDYN_USERNAME=settings.APPDYN_USERNAME
else:
    raise ImproperlyConfigured

if hasattr(settings, 'APPDYN_PASSWORD'):
    APPDYN_PASSWORD=settings.APPDYN_PASSWORD
else:
    raise ImproperlyConfigured

os.environ['PYTHON_EGG_CACHE'] = '/tmp'

def index(request):
    """
    Index page
    """
    #gauges = Gauge.objects.all()
    tag = Tag.objects.filter(name="Global")
    gauges = Gauge.objects.filter(tags=tag)
    #return render_to_response('dashboard/index.html',{'gauges': gauges} )
    response = TemplateResponse(request, 'dashboard/index.html', {'gauges': gauges})
    response['Access-Control-Allow-Origin'] = '*'
    return response

def indexStatic(request):
    """
    IndexStatic  page
    """
    response = TemplateResponse(request, 'dashboard/index-static.html')
    response['Access-Control-Allow-Origin'] = '*'
    return response

def settings(request):
    """ returns settings.js with gauges from db """
    gauges = Gauge.objects.all()
    return render_to_response('dashboard/settings.js',{'gauges': gauges} )

def views(request):
    """ returns settings.js with gauges from db """
    tag = Tag.objects.filter(name="Global")
    gauges = Gauge.objects.filter(tags=tag)
    return render_to_response('dashboard/views.js',{'gauges': gauges} )

def ipad(request):
    """
    Index page
    """
    return render_to_response('dashboard/ipad.html')

from django.http import HttpResponse
import mimetypes
import urllib2

def proxy_to(request, path, target_url):
    url = '%s%s' % (target_url, path)
    print(url)
    if request.META.has_key('QUERY_STRING'):
        url += '?' + request.META['QUERY_STRING']
    try:
        # create a password manager
        password_mgr = urllib2.HTTPPasswordMgrWithDefaultRealm()
        top_level_url = url
        password_mgr.add_password(None, top_level_url, APPDYN_USERNAME, APPDYN_PASSWORD)
        handler = urllib2.HTTPBasicAuthHandler(password_mgr)
        opener = urllib2.build_opener(handler)
        opener.open(url)
        urllib2.install_opener(opener)
        proxied_request = urllib2.urlopen(url)
        status_code = proxied_request.code
        mimetype = proxied_request.headers.typeheader or mimetypes.guess_type(url)
        print(mimetype)
        content = proxied_request.read()
    except urllib2.HTTPError as e:
        return HttpResponse(e.msg, status=e.code, mimetype='text/plain')
    else:
        return HttpResponse(content, status=status_code, mimetype=mimetype)

