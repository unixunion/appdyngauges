import settings
import logging
FORMAT = "%(asctime)-15s %(clientip)s %(user)-8s %(message)s"
logging.basicConfig(level=logging.INFO, format=FORMAT)
logger = logging.getLogger(__name__)

try:
    import simplejson
except:
    from json import simplejson

try:
    import urllib3
    URLLIB3=True
    URLLIB2=False
except:
    import urllib2
    import base64
    URLLIB2=True
    URLLIB3=False

__version__='1.0.0'
__author__='Kegan Holtzhausen <Kegan.Holtzhausen@unibet.com>'

class AppdynamicsAPI:
    def __init__(self, settings=settings, **kwargs):
        """ Initializes the class reading the following variables from settings.py

        APPDYNAMICS=True
        APPDYN_URL='http://appdyn01.domain.com:7999'
        APPDYN_USER='admin@customer1'
        APPDYN_PASS='somepassword'
        APPDYN_APPLICATION='My Application Name'
        """
        try:
            self.url = settings.APPDYN_URL
            lplogger.debugMsg("Connecting to %s" % self.url )
            self.defaultApplication = settings.APPDYN_APPLICATION
            self.application = self.defaultApplication
            self.username = settings.APPDYN_USER
            self.password = settings.APPDYN_PASS
        except Exception, e:
            lplogger.warningMsg("Appdynamics API Error %s" %e)
            raise ConfigurationException
    def setApplicationName(self,application):
        """ Sets application name in Appdynamics to route calls to """
        self.application = application
        return self.application
    def applicationName(self):
        """ returns application name calls are actively being routed to """
        return self.application
    def __restCall(self, url, **kwargs):
        """ Performs the actual restcall """
        try:
            if URLLIB3:
                lplogger.debugMsg("using urllib3 to call %s" % url)
                http = urllib3.PoolManager()
                headers = urllib3.util.make_headers(keep_alive=False, user_agent='libpipeline/1.0',\
                    basic_auth='%s:%s' % (self.username,self.password))
                req = http.request('GET', url, headers=headers,timeout=settings.resttimeout)
                result = simplejson.loads(req.data)
            elif URLLIB2:
                lplogger.debugMsg("using urllib2 to call %s" % url)
                req = urllib2.Request(url)
                headers = base64.encodestring('%s:%s' % (self.username,self.password))[:-1]
                req.add_header("Authorization", "Basic %s" % headers)
                req.add_header('Content_Type','application/json')
                req.add_header('Accept' , 'application/json')
                req.add_header('User_Agent', 'libpipeline/1.0')
                response = urllib2.urlopen(req,None,settings.resttimeout)
                result = simplejson.load(response)
            return result
        except:
            raise

    def getTiers(self):
        """ Returns all tiers as list """
        url = '%s/controller/rest/applications/%s/tiers?output=JSON' % ( self.url, self.application )
        result = self.__restCall(url)
        lplogger.debugMsg(result)
        return result

    def getTier(self, tier):
        """ Returns all tiers as list """
        url = '%s/controller/rest/applications/%s/tiers/%s?output=JSON' % ( self.url, self.application, tier )
        result = self.__restCall(url)
        lplogger.debugMsg(result)
        return result

    def listTiers(self):
        """ Returns tier names as a list """
        result = self.getTiers()
        list = []
        for r in result:
            list.append(r['name'])
        lplogger.debugMsg(result)
        return list

    def listTierNodes(self,product):
        """ List nodes within a tier """
        url = '%s/controller/rest/applications/%s/tiers/%s/nodes?output=JSON' % ( self.url, self.application, product)
        result = self.__restCall(url)
        lplogger.debugMsg(result)
        return result

    def listApplications(self):
        url = '%s/controller/rest/applications?output=JSON' % self.url
        result = self.__restCall(url)
        lplogger.debugMsg(result)
        return result

    def getBusinessTransactions(self):
        """ Returns all business transactions and all fields """
        url = '%s/controller/rest/applications/%s/business-transactions?output=JSON' % ( self.url, self.application )
        result = self.__restCall(url)
        lplogger.debugMsg(result)
        return result

    def listBusinessTransactions(self):
        """ Returns list of {name, tiername} of bt's """
        result = self.getBusinessTransactions()
        list = []
        for r in result:
            list.append({'name': r['name'], 'tier':r['tierName']})
        lplogger.debugMsg(list)
        return list

    def listNodes(self):
        """ Returns list of all nodes """
        url = '%s/controller/rest/applications/%s/nodes?output=JSON' % ( self.url, self.application )
        result = self.__restCall(url)
        mylist = []
        for r in result:
            mylist.append(r['name'])
        lplogger.debugMsg(mylist)
        return mylist

    def getNode(self, node):
        """ Returns node """
        url = '%s/controller/rest/applications/%s/nodes/%s?output=JSON' % ( self.url, self.application, node )
        result = self.__restCall(url)
        lplogger.debugMsg(result)
        return result

    def getViolations(self,time):
        """ Get OPEN violation for last `time` minutes """
        url = '%s/controller/rest/applications/%s/problems/policy-violations?time-range-type=BEFORE_NOW&duration-in-mins=%s&incident-status=OPEN&output=JSON' % ( self.url, self.application,time )
        result = self.__restCall(url)
        lplogger.debugMsg(result)
        return result
    
    def getEvents(self, time):
        """ Return application and diagnostic session type events in last `time` minutes """
        url = '%s/controller/rest/applications/%s/events?time-range-type=BEFORE_NOW&duration-in-mins=%s&event-types=APPLICATION_ERROR,DIAGNOSTIC_SESSION&severities=INFO,WARN,ERROR&output=JSON' % ( self.url, self.application,time )
        result = self.__restCall(url)
        lplogger.debugMsg(result)
        return result

