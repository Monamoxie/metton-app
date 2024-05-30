import os
import stat
from django.http import HttpResponse
from django.contrib.auth import authenticate, login as authLogin
from django.contrib import messages
from django.shortcuts import redirect, render
from django.templatetags.static import static
from core import settings
from core.services.email_service import EmailService
from core.services.user_service import UserService
from dashboard.models.user import User
from dashboard.tasks import email_sender
from .forms import RegisterForm
from django.contrib.auth import get_user_model
from functools import wraps


def guest_only(view_func):
    def _decorator(request, *args, **kwargs):
        if not request.user.is_anonymous:
            return redirect("dashboard")

        return view_func(request, *args, **kwargs)

    return wraps(view_func)(_decorator)


@guest_only
def register(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            form.save()
            # login
            email = form.cleaned_data["email"]
            password = form.cleaned_data["password1"]
            user = authenticate(request, email=email, password=password)
            if user is not None:
                context = {
                    "subject": "Email Verification",
                    "verification_link": "https://mettonapp.com/dashboard",
                }
                template = os.path.join(
                    settings.BASE_DIR,
                    "core/templates/emails/email_verification.html",
                )
                email_sender.delay("Welcome to Metton", [email], template, context)
                authLogin(request, user)
                messages.success(request, "Welcome on board!")
                return redirect("dashboard")
            else:
                messages.error(request, "No user was found")
                return redirect("home")
        else:
            messages.error(request, form.errors)
            return redirect("register")
    else:
        form = RegisterForm()
        return render(request, "authentication/register.html", {"form": form})


def login(request):
    if request.method == "POST":
        # login
        email = request.POST["email"]
        password = request.POST["password"]
        user = authenticate(request, email=email, password=password)
        if user is not None:
            authLogin(request, user)
            messages.success(request, "Welcome back")
            return redirect("dashboard")
        else:
            messages.error(request, "Email/Password is incorrect")
            return redirect("login")
    else:
        return render(request, "authentication/login.html")
