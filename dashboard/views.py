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
    user = User.objects.get(id=request.user.id)
    if request.method == "POST":
        form = EditProfileForm(request.POST or None, instance=user)
        if form.is_valid():
            # user.name = form.cleaned_data["name"]
            form.save()
            messages.success(request, "Profile updated...")
        else:
            messages.success(request, "Profile not updated. An error occured")
    else:
        form = EditProfileForm(instance=user)

    return render(request, "dashboard/edit_profile.html", {"form": form})
