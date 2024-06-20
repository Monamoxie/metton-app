from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import get_user_model

from dashboard.models.user import User


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

    class Meta:
        model = get_user_model()
        fields = ("email",)
