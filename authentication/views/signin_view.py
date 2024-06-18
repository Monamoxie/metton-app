from django.http import HttpRequest, HttpResponse
from django.urls import reverse_lazy
from django.views import View
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.shortcuts import redirect, render
from core.mixins import GuestOnlyMixin


class SigninView(View):
    template_name = "authentication/signin.html"
    success_url = reverse_lazy("signin")

    def post(self, request: HttpRequest) -> HttpResponse:
        email = request.POST["email"]
        password = request.POST["password"]

        if not email or not password:
            messages.error(request, "Email and Password are required.")
            return redirect("signin")

        user = authenticate(request, email=email, password=password)
        if not user:
            messages.error(request, "Email/Password is incorrect")
            return redirect("signin")

        login(request, user)
        messages.success(request, "Welcome back")
        return redirect("dashboard")

    def get(self, request: HttpRequest) -> HttpResponse:
        return render(request, self.template_name)
