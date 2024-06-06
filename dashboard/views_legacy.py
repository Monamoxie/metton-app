from datetime import datetime
import email
import json
import dateutil.parser
from django.http import JsonResponse
import os
from core import settings
from dashboard.enums import EventTypes
from .models import Event
from django.contrib import messages
from django.shortcuts import redirect, render
from django.contrib.auth.decorators import login_required
from dashboard.models import User
from .forms import ScheduleManagerForm
from core.services.event_service import EventService
from django.contrib.auth import logout as authLogout
from core.services.email_service import EmailService
from dashboard.tasks import email_sender


@login_required
def dashboard(request):
    choices = EventTypes.options()
    if request.method == "POST":
        form = ScheduleManagerForm(request.POST or None)
        if form.is_valid():
            type_input_value = (
                form.cleaned_data["type"] if "type" in form.cleaned_data else 2
            )

            user_time_zone = EventService().extract_user_timezone(form.data)

            start_date = form.cleaned_data["start_date"]

            start_time = EventService().timezone_conversion(
                date_str=str(start_date),
                time_str=str(form.cleaned_data["start_time"]),
                from_timezone=user_time_zone,
                to_timezone="UTC",
            )

            end_date = form.cleaned_data["end_date"]
            end_time = EventService().timezone_conversion(
                date_str=str(end_date),
                time_str=str(form.cleaned_data["end_time"]),
                from_timezone=user_time_zone,
                to_timezone="UTC",
            )

            frequency = EventService().get_frequency(form.cleaned_data["frequency"])

            if start_time == None or end_time == None:
                messages.error(
                    request,
                    "Start time/End time could not be processed. Please ensure the correct slots were selected",
                )
                return redirect("schedule_manager")

            if frequency == "" and (start_date == end_date and start_time > end_time):
                messages.error(
                    request,
                    "Start time cannot be greater than End time, when start date and end date are the same",
                )
                return redirect("schedule_manager")

            title = EventService.get_event_title(type_input_value)
            event = Event(
                frequency=EventService().get_frequency(form.cleaned_data["frequency"]),
                user=User.objects.get(id=request.user.id),
                title=title,
                type=type_input_value,
                start_date=start_date,
                start_time=start_time,
                end_date=end_date,
                end_time=end_time,
                timezone=user_time_zone,
            )
            event.save()
            messages.success(request, "Your schedule has been updated!")
            return redirect("schedule_manager")

        else:
            messages.error(request, form.errors)
    else:
        form = ScheduleManagerForm(None)
        # get the next meetings
        appointments = Event.objects.filter(
            start_date__gte=datetime.now().date(),
            type=EventTypes.PUBLIC.value,
        ).order_by("start_date", "start_time")[:7]

        upcoming_appointments = EventService().prep_event_data(
            appointments, format_date_time=True
        )

        next_appointment = {}

        if len(upcoming_appointments) > 0:
            next_appointment = upcoming_appointments.pop(0)

    business_hours = EventService().get_business_hours(user=request.user)

    return render(
        request,
        "dashboard/index.html",
        {
            "form": form,
            "choices": choices,
            "weekday_num": datetime.now().isoweekday(),
            "business_hours": business_hours,
            "display_name": request.user.name,
            "position": request.user.position,
            "next_appointment": next_appointment,
            "upcoming_appointments": upcoming_appointments,
        },
    )


@login_required
def getEvents(request):
    start_date = EventService().get_start_date(request.GET)

    events = Event.objects.filter(
        user=request.user, start_date__gte=start_date
    ).exclude(type=EventTypes.BUSINESS_HOURS.value)
    data = []
    for event in events:
        event_data = {}
        event_data["id"] = str(event.id)
        event_data["title"] = str(event.title)

        start = EventService().timezone_conversion(
            date_str=str(event.start_date),
            time_str=str(event.start_time),
            from_timezone="UTC",
            to_timezone=event.timezone,
            time_only=False,
        )

        event_data["start"] = start

        end = EventService().timezone_conversion(
            date_str=str(event.end_date),
            time_str=str(event.end_time),
            from_timezone="UTC",
            to_timezone=event.timezone,
            time_only=False,
        )

        event_data["end"] = end

        tables = EventService().get_timetable_from_frequency(
            event.frequency.split(","),
            event.start_date,
            EventService().timezone_conversion(
                date_str=str(event.start_date),
                time_str=str(event.start_time),
                from_timezone="UTC",
                to_timezone=event.timezone,
                time_only=True,
            ),
            EventService().timezone_conversion(
                date_str=str(event.end_date),
                time_str=str(event.end_time),
                from_timezone="UTC",
                to_timezone=event.timezone,
                time_only=True,
            ),
            True,
        )

        timetable = []
        for table in tables:
            timetable.append(f"{table[0] + 's'}")

        timetable = "".join(timetable)

        event_data["timetable"] = timetable

        if event.type == EventTypes.UNAVAILABLE.value:
            event_data["display"] = "background"
            event_data["backgroundColor"] = "#502c3c"
            event_data["color"] = "#c0c0c0"
            event_data["classNames"] = "fc-unavailable"

        event_data = dict(event_data)
        data.append(event_data)

    return JsonResponse(
        data=data,
        safe=False,
    )


@login_required
def detachEvent(request):
    if request.method == "POST":
        body = request.body.decode("utf-8")
        if "id" in body:
            data = json.loads(body)
            event = Event.objects.filter(user=request.user, id=data["id"]).first()
            if event:
                event.delete()

    return JsonResponse(
        data=[{"status": True}],
        safe=False,
    )


@login_required
def getBusinessHours(request):
    data = EventService().get_business_hours(request.user)

    return JsonResponse(
        data=data,
        safe=False,
    )


@login_required
def detachBusinessHours(request):
    if request.method == "POST":
        body = request.body.decode("utf-8")
        if "id" in body:
            data = json.loads(body)
            event = Event.objects.filter(
                user=request.user, id=data["id"], type=EventTypes.BUSINESS_HOURS.value
            ).first()
            if event:
                event.delete()

    return JsonResponse(
        data=[{"status": True}],
        safe=False,
    )


@login_required
def logout(request):
    authLogout(request)
    messages.success(request, "Goodbye! See you soon")
    return redirect("index")
