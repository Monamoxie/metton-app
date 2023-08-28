from django.shortcuts import render
from django.contrib.auth import get_user_model


# Create your views here.
def dashboard(request):
    return render(request, "dashboard/home.html")
