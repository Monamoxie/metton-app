from django.db import models
import dashboard

from dashboard.models import Event


class EventService(Event):
    def get_event_title(type):
        if type == 2:
            return Event.EventTypes.BUSINESS_HOURS.name.replace("_", " ")
        else:
            return Event.EventTypes.UNAVAILABLE
