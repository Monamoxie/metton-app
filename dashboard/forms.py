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
    start_date = forms.DateField(
        required=True,
        label="Choose a start date",
        widget=DatePicker(
            options={
                "minDate": "2023-11-20",
                "disabledDates": ["2023-11-24", "2023-11-27"],
                # "enabledHours": [9, 10, 12, 13, 14, 15, 16],
                "ignoreReadonly": False,
                "keepInvalid": False,
                "useCurrent": False,
                # "disabledTimeIntervals": [
                #     [moment({h: 0}), moment({h: 8})],
                #     [moment({h: 18}), moment({h: 24})],
                # ],
                # "disabledTimeIntervals": True,
            },
            attrs={
                "class": "form-control",
                "type": "date",
                "append": "fa fa-calendar",
                "input_toggle": False,
                "icon_toggle": True,
                "readonly": True,
            },
        ),
    )

    start_time = forms.TimeField(
        label="Choose a start time",
        widget=TimePicker(
            options={
                "format": "HH:mm",
                # "disabledHours": True,
                # "disabledHours": [0, 1, 2, 3, 4, 5, 6, 7, 10],
                # 2, 3, 6, 9, 10, 12-17
                "useCurrent": False,
                "disabledTimeIntervals": True,
                "disabledTimeIntervals": [
                    [0, 8],
                ],
            },
            attrs={
                "class": "form-control",
                "type": "time",
                "append": "fa fa-clock",
                "input_toggle": False,
                "icon_toggle": True,
                "readonly": True,
            },
        ),
    )

    class Meta:
        model = Event
        exclude = ("event",)
        # fields = ["start_date", "start_time", "end_date", "end_time", "frequency"]
        fields = []
