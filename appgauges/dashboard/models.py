from django.db import models
from django.utils.encoding import iri_to_uri
from django.utils.http import urlquote
import urllib2

import urlparse, urllib

def fixurl(url):
    # turn string into unicode
    if not isinstance(url,unicode):
        url = url.decode('utf8')

    # parse it
    parsed = urlparse.urlsplit(url)

    # divide the netloc further
    userpass,at,hostport = parsed.netloc.rpartition('@')
    user,colon1,pass_ = userpass.partition(':')
    host,colon2,port = hostport.partition(':')

    # encode each component
    scheme = parsed.scheme.encode('utf8')
    user = urllib.quote(user.encode('utf8'))
    colon1 = colon1.encode('utf8')
    pass_ = urllib.quote(pass_.encode('utf8'))
    at = at.encode('utf8')
    host = host.encode('idna')
    colon2 = colon2.encode('utf8')
    port = port.encode('utf8')
    path = '/'.join(  # could be encoded slashes!
        urllib.quote(urllib.unquote(pce).encode('utf8'),'')
        for pce in parsed.path.split('/')
    )
    query = urllib.quote(urllib.unquote(parsed.query).encode('utf8'),'=&?/')
    fragment = urllib.quote(urllib.unquote(parsed.fragment).encode('utf8'))

    # put it back together
    netloc = ''.join((user,colon1,pass_,at,host,colon2,port))
    return urlparse.urlunsplit((scheme,netloc,path,query,fragment))

class Tag(models.Model):
	name = models.CharField(max_length=64)
	def __unicode__(self):
		return self.name

class Gauge(models.Model):
	name = models.CharField(max_length=64)
	rest_url = models.CharField(max_length=1024)
	rest_url.help_text = "rest url copied from appdyn starting with /controller/ or /appdyn/controller/. remember to add &output=JSON"
	maximum = models.CharField(max_length=32, default=600, blank=True, null=True)
	tags = models.ManyToManyField(Tag)
	def __unicode__(self):
		return self.name
	def cleanUrl(self):
		print urlquote(self.rest_url)
		print fixurl(self.rest_url)
		return fixurl(urlquote(self.rest_url) + '&output=JSON')
