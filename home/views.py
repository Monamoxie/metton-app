import json
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


def book(request, public_id):
    user = None
    errors = []

    def cleanup(type, value):
        if type == "public_id":
            user = User.objects.filter(public_id=public_id).first()
            if user is None:
                errors.append("No user found")
            return user
        else:
            mst = ["start_date", "start_time", "end_date", "end_time"]
            t_splt = type.split("_")
            f_type = " ".join(t_splt)

            if type in mst and not value:
                errors.append(f_type + " cannot be empty")

        return value

    if request.method == "POST":
        body = request.body.decode("utf-8")
        data = json.loads(body)

        user = cleanup("public_id", public_id)
        start_date = cleanup("start_date", data.get("start_date"))
        start_time = cleanup("start_time", data.get("start_time"))
        end_date = cleanup("end_date", data.get("end_date"))
        end_time = cleanup("end_time", data.get("end_time"))
        frequencies = cleanup("frequencies", data.get("frequencies"))
        title = cleanup("title", data.get("title"))
        email = cleanup("email", data.get("email"))
        note = cleanup("note", data.get("note"))
        endRecur = cleanup("endRecur", data.get("endRecur"))

        frequencies = EventService().get_frequency(data.get("frequencies"))

        if frequencies == "" and (start_date == end_date and start_time > end_time):
            errors.append(
                "Start time cannot be greater than End time, when start date and end date are the same"
            )

        if len(frequencies) > 0:
            if not endRecur:
                errors.append(
                    "Please provide an end date for the reccuring appointment"
                )
        else:
            if endRecur:
                errors.append("Please select the repeated days for this appointment")

        try:
            endRecur = datetime.strptime(endRecur, "%Y-%m-%d")
        except:
            errors.append("Invalid date format for Recurring End Date")

        if endRecur < datetime.strptime(start_date, "%Y-%m-%d"):
            errors.append("Recurring end date cannot be less than start date")

        if len(errors) > 0:
            return JsonResponse(
                {"message": "Please fix the following errors", "errors": errors},
                status=404,
            )
        else:
            type_input_value = Event.EventTypes.PUBLIC
            user_time_zone = EventService().extract_user_timezone(data=data)

            event = Event(
                frequency=frequencies,
                user=user,
                title=title,
                type=type_input_value,
                start_date=start_date,
                start_time=start_time,
                end_date=end_date,
                end_time=end_time,
                timezone=user_time_zone,
                note=note,
                attendees=email,
                end_recur=endRecur,
            )
            event.save()
            return JsonResponse(
                {
                    "message": "Booking completed",
                    "errors": [],
                },
                status=200,
            )
