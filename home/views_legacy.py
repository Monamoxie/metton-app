import json
from django.http import Http404, JsonResponse
from django.shortcuts import render
from datetime import datetime
from core import settings
from dashboard.enums import RecurrenceTypes
from dashboard.enums import EventTypes
from dashboard.models import User
from dashboard.models import Event
from core.services import EventService


def getUserEvents(request, public_id):
    data = EventService().get_events(inputs=request.GET, public_id=public_id)

    return JsonResponse(
        data=data,
        safe=False,
    )
