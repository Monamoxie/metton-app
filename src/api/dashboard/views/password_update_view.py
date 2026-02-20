from typing import Union
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.messages.views import SuccessMessageMixin
from django.views.generic.edit import UpdateView
from django.contrib import messages
from django.urls import reverse_lazy
from django.contrib.messages.views import SuccessMessageMixin
from core.utils import get_template_path
from dashboard.forms import PasswordUpdateForm
from dashboard.models.user import User
from dashboard.tasks import email_sender
from django.contrib.auth.models import AbstractBaseUser, AnonymousUser


class PasswordUpdateView(LoginRequiredMixin, SuccessMessageMixin, UpdateView):
    """
    Handles User password updating
    """

    form_class = PasswordUpdateForm
    template_name = "dashboard/password_update.html"
    success_message = "Password update was successful!"
    success_url = reverse_lazy("password-update")

    def get_object(self):
        return self.request.user

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()

        # Necessary because great-grand base class, forms.Form, does not take instance as an argument
        kwargs.pop("instance")

        kwargs["request"] = self.request
        kwargs["user"] = self.request.user

        return kwargs

    def form_valid(self, form: PasswordUpdateForm):
        form.save()
        template = get_template_path("identity", "emails/password_updated.email.html")

        email_sender.delay("Password Updated!", [self.request.user.email], template, {})
        return super().form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, f"{form.errors}")
        return super().form_invalid(form)
