from django.http import JsonResponse
from django.shortcuts import render
from datetime import datetime

from dashboard.models import Event, User
from dashboard.services.eventservice import EventService


# Create your views here.
def meet(request, public_id):
    user = User.objects.filter(public_id=public_id).first()
    if not user:
        # return a 404
        pass

    today = datetime.today()
    first_day_of_month = d1 = today.strftime("%Y-%m-01")

    choices = Event().get_frequency_choices

    return render(
        request,
        "home/meet.html",
        {
            "first_day_of_month": first_day_of_month,
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
