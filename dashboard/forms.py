from dataclasses import fields
import os
from django import forms
from django.contrib.auth import get_user_model
from .models import Event
from tempus_dominus.widgets import DatePicker, TimePicker, DateTimePicker


class EditProfileForm(forms.ModelForm):
    class Meta:
        model = get_user_model()
        exclude = ("user",)
        fields = ["name", "company", "position", "profile_summary", "profile_photo"]

    def clean_profile_photo(self):
        profile_photo = self.cleaned_data.get("profile_photo", None)
        if profile_photo:
            if profile_photo.content_type not in [
                "image/jpeg",
                "image/jpg",
                "image/png",
            ]:
                raise forms.ValidationError(
                    "Only jpg, jpeg and png formats are supported"
                )
            elif (profile_photo.size / 1000) > 5000:
                raise forms.ValidationError("Photo size should not be more than 5 MB")

        return profile_photo


class ChangePasswordForm(forms.ModelForm):
    existing_password = forms.CharField(
        label="Please enter existing password",
        widget=forms.PasswordInput(
            attrs={
                "class": "form-control",
                "password": "password",
                "placeholder": "Create Password",
            }
        ),
    )

    password1 = forms.CharField(
        label="Choose a new password",
        widget=forms.PasswordInput(
            attrs={
                "class": "form-control",
                "password": "password",
                "placeholder": "Create Password",
            }
        ),
    )

    password2 = forms.CharField(
        label="Confirm your new password",
        widget=forms.PasswordInput(
            attrs={
                "class": "form-control",
                "password": "password",
                "placeholder": "Confirm Password",
            }
        ),
    )

    def clean_password2(self):
        password2 = self.cleaned_data.get("password2", None)
        if password2 != self.cleaned_data.get("password1"):
            raise forms.ValidationError("Password 1 and 2 does not match")

        return password2

    def clean_existing_password(self):
        existing_password = self.cleaned_data.get("existing_password")
        if self.instance.check_password(existing_password) is not True:
            raise forms.ValidationError("The existing password does not match")

        return existing_password

    class Meta:
        model = get_user_model()
        exclude = ("user",)
        fields = []


# Set Unavailable dates
class UnavailableDatesForm(forms.ModelForm):
    # frequency = forms.CharField(
    #     required=False,
    #     label="Choose frequency",
    #     widget=forms.CheckboxSelectMultiple(
    #         attrs={
    #             "class": "form-control form-check-input me-1",
    #         },
    #         choices=(
    #             (0, "R1"),
    #             (1, "R2"),
    #             (2, "F"),
    #         ),
    #     ),
    # )

    start_date = forms.DateField(
        required=True,
        label="Start Date",
        widget=DatePicker(
            attrs={
                "class": "form-control",
                "type": "date",
                "disabled": "disabled",
            },
        ),
    )

    start_time = forms.TimeField(
        required=True,
        label="Start Time",
        widget=TimePicker(
            attrs={
                "format": "HH:mm",
                "class": "form-control",
                "type": "date",
                "disabled": "disabled",
            },
        ),
    )

    end_date = forms.DateField(
        required=True,
        label="End Date",
        widget=DatePicker(
            attrs={
                "class": "form-control",
                "type": "date",
                "disabled": "disabled",
            },
        ),
    )

    end_time = forms.TimeField(
        required=True,
        label="End Time",
        widget=TimePicker(
            attrs={
                "format": "HH:mm",
                "class": "form-control",
                "disabled": "disabled",
                "type": "time",
            },
        ),
    )

    class Meta:
        model = Event
        exclude = ("event",)
        fields = []
