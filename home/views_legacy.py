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


def index(request):
    return render(request, "home/index.html", {})


# Create your views here.
def meet(request, public_id):
    user = User.objects.filter(public_id=public_id).first()
    if not user:
        raise Http404("User not found")

    today = datetime.today()
    first_day_of_month = today.strftime("%Y-%m-01")

    choices = RecurrenceTypes.options()

    return render(
        request,
        "home/meet.dj.html",
        {
            "first_day_of_month": first_day_of_month,
            "base_url": settings.BASE_URL,
            "choices": choices,
            "user": user,
            "public_id": public_id,
        },
    )


def getUserBusinessHours(request, public_id):
    data = EventService().get_business_hours(user=None, public_id=public_id)

    return JsonResponse(
        data=data,
        safe=False,
    )


def getUserEvents(request, public_id):
    data = EventService().get_events(inputs=request.GET, public_id=public_id)

    return JsonResponse(
        data=data,
        safe=False,
    )
