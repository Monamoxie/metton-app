from email import message
from datetime import datetime
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
