from django.shortcuts import render
from datetime import datetime

from dashboard.models import Event


# Create your views here.
def meet(request, public_id):
    today = datetime.today()
    first_day_of_month = d1 = today.strftime("%Y-%m-01")

    choices = Event().get_frequency_choices

    return render(
        request,
        "home/meet.html",
        {"first_day_of_month": first_day_of_month, "choices": choices},
    )
