from celery import task
import settings

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

@task()
def add(x, y):
    return x + y

@task()
def get_application_list(**kwargs):
    """ returns list of applications available within appdynamics """
    pass
