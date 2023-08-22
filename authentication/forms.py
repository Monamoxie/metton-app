from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.forms import get_user_model


class RegisterForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        models = get_user_model()
        fields = ("email",)
