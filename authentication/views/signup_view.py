from django.forms import BaseModelForm
from django.http import HttpResponse
from django.urls import reverse_lazy
from django.views.generic import CreateView
from authentication.forms import RegisterForm
from core.mixins import GuestOnlyMixin
from django.contrib.auth import authenticate, login
from django.contrib import messages
import os
from core import settings
from dashboard.tasks import email_sender
from django.shortcuts import redirect
from asgiref.sync import async_to_sync

class SignupView(GuestOnlyMixin, CreateView):
    template_name = "authentication/signup.html"
    form_class = RegisterForm
    success_url = reverse_lazy("dashboard")

    def form_valid(self, form):
        form.save()

        user_email = form.cleaned_data["email"]
        user = authenticate(
            self.request,
            email=user_email,
            password=form.cleaned_data["password1"],
        )

        if not user:
            messages.error(
                self.request,
                "No user found",
            )
            return self.form_invalid(form)

        self.send_signup_email(user_email)

        login(self.request, user)

        messages.success(self.request, "Welcome on board!")
        return redirect(self.get_success_url())

    def form_invalid(self, form: BaseModelForm) -> HttpResponse:
        messages.error(self.request, f"{form.errors}")
        return super().form_invalid(form)

    def send_signup_email(self, user_email: str):
        """Trigger a welcome email call to Celery/RabbitMQ"""
        context = {
            "subject": "Email Verification",
            "verification_link": "https://mettonapp.com/dashboard",
        }

        template = os.path.join(
            settings.BASE_DIR,
            "core/templates/emails/email_verification.html",
        )
        email_sender.delay("Welcome to Metton", [user_email], template, context)
