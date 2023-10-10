from django.contrib import messages
from django.shortcuts import redirect, render
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from core.settings import MEDIA_ROOT

from dashboard.models import User
from .forms import EditProfileForm
from django.core.files import File
import os


# Create your views here.
@login_required
def dashboard(request):
    return render(request, "dashboard/home.html")


def editProfile(request):
    user = User.objects.get(id=request.user.id)
    err_message = None
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
