from ast import dump
from audioop import reverse
from dbm import dumb
from email import message
from datetime import datetime
import time
from tracemalloc import start
import dateutil.parser
from django.http import HttpResponseRedirect, JsonResponse
from .models import Event
from django.contrib import messages
from django.shortcuts import redirect, render
from django.contrib.auth.decorators import login_required
from dashboard.models import User
from .forms import EditProfileForm, ChangePasswordForm, UnavailableDatesForm
from django.core.files import File
import os
from .services.eventservice import EventService
import pytz


# Create your views here.
@login_required
def dashboard(request):
    return render(request, "dashboard/home.html")


@login_required
def editProfile(request):
    user = User.objects.get(id=request.user.id)
    if request.method == "POST":
        form = EditProfileForm(
            request.POST or None, request.FILES or None, instance=user
        )
        if form.is_valid():
            form.save()
            messages.success(request, "Profile updated...")
            return redirect("edit-profile")
        else:
            messages.error(request, form.errors)
    else:
        form = EditProfileForm(instance=user)

    return render(request, "dashboard/edit_profile.html", {"form": form})


@login_required
def changePassword(request):
    user = User.objects.get(id=request.user.id)
    if request.method == "POST":
        form = ChangePasswordForm(request.POST or None, instance=user)
        if form.is_valid():
            user.set_password(form.cleaned_data.get("password1"))
            user.save()

            messages.success(request, "Password update was successful!")
            return redirect("dashboard")
        else:
            messages.error(request, form.errors)
    else:
        form = ChangePasswordForm(instance=user)

    return render(request, "dashboard/password_update.html", {"form": form})


@login_required
def manageSchedule(request):
    choices = Event().get_frequency_choices
    if request.method == "POST":
        form = UnavailableDatesForm(request.POST or None)
        if form.is_valid():
            type_input_value = (
                form.cleaned_data["type"] if "type" in form.cleaned_data else 2
            )  # unavailable

            user_time_zone = extract_user_timezone(form.data)

            start_date = form.cleaned_data["start_date"]
            start_time = user_timezone_to_utc(
                str(start_date),
                str(form.cleaned_data["start_time"]),
                user_time_zone,
            )
            end_date = form.cleaned_data["end_date"]
            end_time = user_timezone_to_utc(
                str(end_date),
                str(form.cleaned_data["end_time"]),
                user_time_zone,
            )

            if start_time == None or end_time == None:
                messages.error(
                    request,
                    "Start time/End time could not be processed. Please ensure the correct slots were selected",
                )
                return redirect("manage.schedule")

            if start_date == end_date and start_time > end_time:
                messages.error(
                    request,
                    "Start time cannot be greater than End time, when start date and end date are the same",
                )
                return redirect("manage.schedule")

            title = EventService.get_event_title(type_input_value)
            event = Event(
                frequency=get_frequency(form.cleaned_data["frequency"]),
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

            # todo ::: use HttpResponseRedirect after POST operations
            return HttpResponseRedirect(reverse("manage.schedule"))

        else:
            messages.error(request, form.errors)
    else:
        form = UnavailableDatesForm(request)

    return render(
        request,
        "dashboard/manage_schedules.html",
        {"form": form, "choices": choices, "weekday_num": datetime.now().isoweekday()},
    )


@login_required
def getEvents(request):
    params = request.GET

    start_date = get_start_date(params)
    end_date = get_end_date(params)
    type = params["type"]

    events = Event.objects.filter(
        user=request.user, start_date__gte=start_date
    ).exclude(type=Event.EventTypes.BUSINESS_HOURS)
    data = []
    for event in events:
        event_data = {}
        event_data["id"] = str(event.id)
        event_data["title"] = str(event.title)
        event_data["start"] = str(datetime.combine(event.start_date, event.start_time))
        event_data["end"] = str(datetime.combine(event.end_date, event.end_time))

        # str(dateutil.parser.parse(start_date).date())

        if event.type == "unavailable":
            event_data["display"] = "background"
            # event_data["backgroundColor"] = "#900"
            # event_data["color"] = "#060"
            event_data["classNames"] = "fc-unavailable"
            event_data["selectable"] = False

        event_data = dict(event_data)
        data.append(event_data)

    return JsonResponse(
        data=data,
        safe=False,
    )


@login_required
def getBusinessHours(request):
    events = Event.objects.filter(
        user=request.user, type=Event.EventTypes.BUSINESS_HOURS
    )
    data = []
    for event in events:
        event_data = {}
        event_data["daysOfWeek"] = event.frequency.split(",")
        event_data["startTime"] = str(event.start_time)[0:5]
        event_data["endTime"] = str(event.end_time)[0:5]

        event_data = dict(event_data)
        data.append(event_data)

    return JsonResponse(
        data=data,
        safe=False,
    )


def get_frequency(form_frequencies):
    frequency = ""
    if form_frequencies is not None:
        form_frequencies = eval(form_frequencies)
        for f in form_frequencies:
            if f != "no":
                prepender = (
                    ","
                    if len(form_frequencies) != (form_frequencies.index(f) + 1)
                    else ""
                )
                frequency += str(f) + prepender

    return frequency


def get_start_date(params):
    if "start" in params:
        start_date = str(params["start"])
    else:
        start_date = str(datetime.now())

    return str(dateutil.parser.parse(start_date).date())


def get_end_date(params):
    if "end" in params:
        end_date = params["start"]
    else:
        end_date = None

    return str(dateutil.parser.parse(end_date).date())


def extract_user_timezone(data):
    if "utz" in data and data["utz"]:
        return data["utz"]
    return "UTC"


def user_timezone_to_utc(date_str, time_str, utz):
    user_timezone = pytz.timezone(utz)
    utc_timezone = pytz.UTC

    date_list = date_str.split("-")
    time_list = time_str.split(":")

    if len(date_list) == 3 and len(time_list) == 3:
        selected_dt = datetime(
            year=int(date_list[0]),
            month=int(date_list[1]),
            day=int(date_list[2]),
            hour=int(time_list[0]),
            minute=int(time_list[1]),
            second=int(time_list[2]),
        )
        user_timezone_aware = user_timezone.localize(selected_dt)

        return user_timezone_aware.astimezone(utc_timezone).time()

    return None
