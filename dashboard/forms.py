from dataclasses import fields
import os
from random import choices
from django import forms
from django.contrib.auth import get_user_model
from .models import Event, User
from tempus_dominus.widgets import DatePicker, TimePicker, DateTimePicker


class EditProfileForm(forms.ModelForm):
    name = forms.IntegerField(
        required=True,
        label="Name",
        widget=forms.TextInput(
            attrs={
                "class": "form-control",
                "type": "text",
            },
        ),
    )

    company = forms.IntegerField(
        required=True,
        label="Company",
        widget=forms.TextInput(
            attrs={
                "class": "form-control",
                "type": "text",
            },
        ),
    )

    position = forms.IntegerField(
        required=True,
        label="Position",
        widget=forms.TextInput(
            attrs={
                "class": "form-control",
                "type": "text",
            },
        ),
    )

    profile_summary = forms.IntegerField(
        required=True,
        label="Profile Summary",
        widget=forms.Textarea(
            attrs={
                "class": "form-control",
                "type": "text",
            },
        ),
    )

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
    type = forms.IntegerField(
        required=True,
        label="Choose Type",
        widget=forms.Select(
            attrs={
                "class": "form-control",
                "type": "text",
            },
            choices=(
                ("", "Please Select"),
                (
                    Event.EventTypes.BUSINESS_HOURS,
                    Event.EventTypes.labels[1],
                ),
                (Event.EventTypes.UNAVAILABLE, Event.EventTypes.labels[2]),
            ),
        ),
    )

    frequency = forms.CharField(
        required=True,
        label="Choose Frequency",
        widget=forms.CheckboxSelectMultiple(
            attrs={
                "class": "form-control",
                "type": "date",
                "readonly": "readonly",
            },
        ),
    )
    start_date = forms.DateField(
        required=True,
        label="Start Date",
        widget=DatePicker(
            attrs={
                "type": "date",
                "readonly": "readonly",
            },
        ),
    )

    start_time = forms.TimeField(
        required=True,
        label="Start Time",
        widget=TimePicker(
            attrs={
                "format": "HH:mm",
                "type": "date",
                "readonly": "readonly",
            },
        ),
    )

    end_date = forms.DateField(
        required=True,
        label="End Date",
        widget=DatePicker(
            attrs={
                "type": "date",
                "readonly": "readonly",
            },
        ),
    )

    end_time = forms.TimeField(
        required=True,
        label="End Time",
        widget=TimePicker(
            attrs={
                "format": "HH:mm",
                "readonly": "readonly",
                "type": "time",
            },
        ),
    )

    utz = (
        forms.CharField(
            required=False,
            label="Utz",
            widget=forms.TextInput(
                attrs={
                    "readonly": "readonly",
                },
            ),
        ),
    )

    # def __init__(self, user, *args, **kwargs):
    #     super(UnavailableDatesForm, self).__init__(*args, **kwargs)

    #     # Pull the user model out, then get the value for has_business_hours
    #     user = User.objects.filter(id=user.id).first()

    #     choices = [("", "Please Select")]

    #     if not user.has_business_hours():
    #         choices.append(
    #             (Event.EventTypes.BUSINESS_HOURS, Event.EventTypes.labels[1])
    #         )

    #     choices.append((Event.EventTypes.UNAVAILABLE, Event.EventTypes.labels[2]))

    #     self.fields["type"].widget = forms.Select(
    #         attrs={
    #             "class": "form-control",
    #             "type": "text",
    #         },
    #         choices=choices,
    #     )

    class Meta:
        model = Event
        # exclude = ("event",)
        fields = [
            "type",
            "start_date",
            "start_time",
            "frequency",
            "end_date",
            "end_time",
        ]
