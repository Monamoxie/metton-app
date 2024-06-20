from dataclasses import fields
import os
from random import choices
from django import forms
from .models import Event, User
from tempus_dominus.widgets import DatePicker, TimePicker, DateTimePicker

from dashboard.enums import EventTypes





# Set Unavailable dates
class ScheduleManagerForm(forms.ModelForm):
    type = forms.CharField(
        required=True,
        label="Choose Type",
        widget=forms.Select(
            attrs={
                "class": "form-control mb-3",
                "type": "text",
            },
            choices=(
                ("", "Please Select"),
                (
                    EventTypes.BUSINESS_HOURS.value,
                    EventTypes.BUSINESS_HOURS.get_name(),
                ),
                (EventTypes.UNAVAILABLE.value, EventTypes.UNAVAILABLE.get_name()),
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
    #     super(ScheduleManagerForm, self).__init__(*args, **kwargs)

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
