import os
from django.contrib.auth import authenticate, login as authLogin
from django.contrib import messages
from django.shortcuts import redirect, render
from core import settings
from dashboard.tasks import email_sender
from functools import wraps


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
            return redirect("signin")
    else:
        return render(request, "authentication/login.html")
