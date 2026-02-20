from dataclasses import fields
from django import forms
from dashboard.models import Event
from tempus_dominus.widgets import DatePicker, TimePicker
from dashboard.enums import EventTypes


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

    class Meta:
        model = Event
        fields = [
            "type",
            "start_date",
            "start_time",
            "frequency",
            "end_date",
            "end_time",
        ]
