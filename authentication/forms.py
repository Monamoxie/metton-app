from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import get_user_model


class RegisterForm(UserCreationForm):
    email = forms.EmailField(
        label="Email Address",
        widget=forms.TextInput(
            attrs={"class": "form-control", "placeholder": "Email Address"}
        ),
    )

    password1 = forms.TextInput(
        label="Choose a Password",
        widget=forms.TextInput(
            attrs={"class": "form-control", "placeholder": "Password"}
        ),
    )

    class Meta(UserCreationForm.Meta):
        model = get_user_model()
        fields = ("email", "password1", "password2")


class LoginForm:
    class Meta(UserCreationForm.Meta):
        model = get_user_model()
        fields = ("email",)
