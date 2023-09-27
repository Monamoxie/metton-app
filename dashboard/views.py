from django.contrib import messages
from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required

from dashboard.models import User
from .forms import EditProfileForm


# Create your views here.
@login_required
def dashboard(request):
    return render(request, "dashboard/home.html")


def editProfile(request):
    if request.method == "POST":
        form = EditProfileForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Profile updated...")
        else:
            messages.success(request, "Profile not updated. An error occured")
    else:
        form = EditProfileForm()

    return render(request, "dashboard/edit_profile.html", {"form": form})
