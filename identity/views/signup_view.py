from django.forms import BaseModelForm
from django.http import HttpResponse
from django.urls import reverse_lazy
from django.views.generic import CreateView
from identity.forms import SignupForm
from core.mixins import GuestOnlyMixin
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.shortcuts import redirect
from identity.utils import send_signup_email


class SignupView(GuestOnlyMixin, CreateView):
    template_name = "identity/signup.html"
    form_class = SignupForm
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

        send_signup_email(user=user)

        login(self.request, user)

        messages.success(self.request, "Welcome on board!")
        return redirect(self.success_url)

    def form_invalid(self, form: BaseModelForm) -> HttpResponse:
        messages.error(self.request, f"{form.errors}")
        return super().form_invalid(form)
