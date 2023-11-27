from email import message
from datetime import datetime
import json
import dateutil.parser
from tracemalloc import start

from django.http import JsonResponse
from .models import Event
from django.contrib import messages
from django.shortcuts import redirect, render
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from core.settings import MEDIA_ROOT

from dashboard.models import User
from .forms import EditProfileForm, ChangePasswordForm, UnavailableDatesForm
from django.core.files import File
import os


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
            # dd(event)
            event = Event(
                frequency=get_frequency(form.cleaned_data["frequency"]),
                user=User.objects.get(id=request.user.id),
                title="Unavailable",
                closed_dates=True,
                start_date=form.cleaned_data["start_date"],
                start_time=form.cleaned_data["start_time"],
                end_date=form.cleaned_data["end_date"],
                end_time=form.cleaned_data["end_time"],
            )
            event.save()
            messages.success(request, "Your schedule has been updated!")
            return redirect("manage.schedule")
        else:
            messages.error(request, form.errors)
    else:
        event = Event.objects.filter(user=request.user, closed_dates=True)
        form = UnavailableDatesForm()

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

    events = Event.objects.filter(user=request.user, start_date__gte=start_date)
    data = []
    for event in events:
        event_data = {}
        event_data["id"] = str(event.id)
        event_data["title"] = str(event.title)
        event_data["start"] = str(datetime.combine(event.start_date, event.start_time))
        event_data["end"] = str(datetime.combine(event.end_date, event.end_time))

        # str(dateutil.parser.parse(start_date).date())

        if event.closed_dates is True:
            event_data["display"] = "background"
            # event_data["backgroundColor"] = "#900"
            # event_data["color"] = "#060"
            event_data["classNames"] = "fc-unavailable"
            event_data["selectable"] = False

        event_data = dict(event_data)
        data.append(event_data)

    # dd(data)
    return JsonResponse(
        data=data,
        safe=False,
    )

    # JsonResponse(
    #     [
    #         {
    #             "id": "UUID1",
    #             "title": "event1",
    #             "start": "2023-11-25T12:00:00",
    #             "end": "2023-11-28T14:00:00",
    #             "allDay": False,
    #         },
    #         {
    #             "id": "UUID2",
    #             "title": "event2",
    #             "startRecur": "2023-11-13",
    #             # // endRecur: '2023-11-14',
    #             "startTime": "13:00:00",
    #             "endTime": "14:00:00",
    #             "daysOfWeek": [
    #                 1,
    #                 3,
    #                 5,
    #             ],  # Repeat frequency
    #             "allDay": False,
    #             "groupId": "Series-group-id",
    #         }
    #         # {
    #         #     id: 'UUID3',
    #         #     title  : 'event3',
    #         #     start  : '2023-11-15T12:30:00',
    #         #     start  : '2023-11-16T00:00:00',
    #         #     allDay : true
    #         # },
    #         # {
    #         #     id: 'UUID4',
    #         #     start: '2023-11-24T00:00:00',
    #         #     end: '2023-11-25T23:59:00',
    #         #     display: 'background',
    #         #     backgroundColor: '#900',
    #         #     selectable: false,
    #         #     classNames: "fc-unavailable",
    #         #     title  : 'Unavailable',
    #         #     description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras eu pellentesque nibh. In nisl nulla, convallis ac nulla eget, pellentesque pellentesque magna.',
    #         # },
    #     ],
    #     safe=False,
    # )


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
