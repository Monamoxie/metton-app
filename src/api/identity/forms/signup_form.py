from cProfile import label
from django import forms
from django.contrib.admin import action
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import get_user_model
from django.http import HttpResponseBadRequest
from django.core.exceptions import ValidationError

from core import settings
from dashboard.models.user import User
from django_recaptcha.fields import ReCaptchaField
from django_recaptcha.widgets import ReCaptchaV3


class SignupForm(UserCreationForm):
    email = forms.EmailField(
        label="Email Address",
        widget=forms.TextInput(attrs={"placeholder": "Email Address"}),
    )

    password1 = forms.CharField(
        label="Choose a Password",
        widget=forms.PasswordInput(attrs={"placeholder": "Create Password"}),
    )

    password2 = forms.CharField(
        label="Confirm your Password",
        widget=forms.PasswordInput(attrs={"placeholder": "Confirm Password"}),
    )

    source = forms.CharField(
        required=False,
        label="",
        widget=forms.HiddenInput(),
    )

    class Meta:
        model = get_user_model()
        fields = ("email",)

    def clean_source(self):
        """Honeypot validation: if filled, reject the request."""
        if self.cleaned_data.get("source"):
            raise ValidationError("Invalid request.")
        return ""

    def save(self, *args, **kwargs):
        """Handle bad requests from bots filling honeypot."""
        if self.cleaned_data.get("source"):
            return HttpResponseBadRequest("Bad request detected.")
        return super().save(*args, **kwargs)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Dynamically add captcha if enabled
        if settings.HAS_GOOGLE_RECAPTCHA:
            self.fields["captcha"] = ReCaptchaField(widget=ReCaptchaV3, label="")
