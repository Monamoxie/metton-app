from django.http import HttpResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.shortcuts import redirect, render
from .forms import RegisterForm


# Create your views here.
def home(request):
    pass


def register(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            dd(form)
            form.save()
            # login
            email = form.cleaned_data["email"]
            password = form.cleaned_data["password1"]
            user = authenticate(request, email=email, password=password)
            if user is not None:
                login(request, user)
                messages.success("Welcome on board!")
                return redirect("dashboard")
            else:
                messages.error("No user was found")
                return redirect("home")
    else:
        form = RegisterForm()
        return render(request, "authentication/register.html", {"form": form})


def login(request):
    return render(request, "authentication/login.html")
