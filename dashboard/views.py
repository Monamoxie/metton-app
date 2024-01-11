from datetime import datetime
import json
import dateutil.parser
from django.http import JsonResponse
from .models import Event
from django.contrib import messages
from django.shortcuts import redirect, render
from django.contrib.auth.decorators import login_required
from dashboard.models import User
from .forms import EditProfileForm, ChangePasswordForm, UnavailableDatesForm
from .services.eventservice import EventService
from django.contrib.auth import logout as authLogout


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
                return redirect("manage.schedule")

            if frequency == "" and (start_date == end_date and start_time > end_time):
                messages.error(
                    request,
                    "Start time cannot be greater than End time, when start date and end date are the same",
                )
                return redirect("manage.schedule")

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
            return redirect("manage.schedule")

        else:
            messages.error(request, form.errors)
    else:
        form = UnavailableDatesForm(None)

    business_hours = EventService().get_business_hours(user=request.user)

    return render(
        request,
        "dashboard/manage_schedules.html",
        {
            "form": form,
            "choices": choices,
            "weekday_num": datetime.now().isoweekday(),
            "business_hours": business_hours,
            "display_name": request.user.name,
            "position": request.user.position,
        },
    )


@login_required
def dashboard(request):
    choices = Event().get_frequency_choices
    if request.method == "POST":
        form = UnavailableDatesForm(request.POST or None)
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
                return redirect("manage.schedule")

            if frequency == "" and (start_date == end_date and start_time > end_time):
                messages.error(
                    request,
                    "Start time cannot be greater than End time, when start date and end date are the same",
                )
                return redirect("manage.schedule")

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
            return redirect("manage.schedule")

        else:
            messages.error(request, form.errors)
    else:
        form = UnavailableDatesForm(None)
        # get the next meetings
        appointments = Event.objects.filter(
            start_date__gte=datetime.now().date(),
            type=Event.EventTypes.PUBLIC,
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
    ).exclude(type=Event.EventTypes.BUSINESS_HOURS)
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

        if event.type == Event.EventTypes.UNAVAILABLE:
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
                user=request.user, id=data["id"], type=Event.EventTypes.BUSINESS_HOURS
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
