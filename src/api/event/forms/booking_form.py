from django.http import HttpRequest
from core.services.event_service import EventService
from event.exceptions import ScheduleNotFoundError
from event.models import Event
from event.services import AvailabilityService, ScheduleService
from typing import Any, Union
from django import forms

from identity.models.user import User


class BookingForm(forms.ModelForm):
    start_date = forms.DateField()
    start_time = forms.TimeField()
    end_date = forms.DateField()
    end_time = forms.TimeField()
    frequencies = forms.CharField()
    title = forms.CharField()
    email = forms.CharField()
    note = forms.CharField()
    end_recur = forms.DateField(required=False)
    user_timezone = forms.CharField()

    def __init__(self, *args, **kwargs):
        self.user: Union[User, None] = kwargs.pop("user", None)
        super().__init__(*args, **kwargs)

    def clean(self) -> dict[str, Any]:
        cleaned_data = super().clean()

        start_date = cleaned_data.get("start_date")
        end_date = cleaned_data.get("end_date")
        start_time = cleaned_data.get("start_time")
        end_time = cleaned_data.get("end_time")
        frequencies = cleaned_data.get("frequencies")
        end_recur = cleaned_data.get("end_recur")

        if not self.user:
            self.add_error(None, "No account found with this ID")

        # Validate start and end times
        if (
            start_date == end_date
            and start_time
            and end_time
            and start_time >= end_time
        ):
            self.add_error(
                "start_time",
                "Start time must be less than end time for same day bookings.",
            )

        # Validate recurring appointments
        frequencies = EventService.get_frequency(frequencies)
        if frequencies:
            if not end_recur:
                self.add_error(
                    "frequencies",
                    "End recur date is required for recurring appointments",
                )
        else:
            if end_recur:
                self.add_error(
                    "frequencies",
                    "Frequencies must be provided for recurring appointments",
                )

        # Validate end_recur date
        if end_recur and end_recur < start_date:
            self.add_error("end_recur", "End recur date must be after the start date")

        user_timezone = cleaned_data.get("user_timezone")
        if self.user and start_date and start_time and end_date and end_time and user_timezone:
            allow_multiple = False
            buffer_before = 0
            buffer_after = 0
            try:
                schedule = ScheduleService.get_default_for_user(self.user)
                rules = getattr(schedule, "booking_rules", None)
                if rules:
                    allow_multiple = rules.allow_multiple_per_slot
                    buffer_before = rules.buffer_before_minutes
                    buffer_after = rules.buffer_after_minutes
            except ScheduleNotFoundError:
                pass

            if not allow_multiple and AvailabilityService.has_conflicting_booking(
                self.user,
                start_date,
                start_time,
                end_date,
                end_time,
                user_timezone,
                buffer_before,
                buffer_after,
            ):
                self.add_error(
                    None, "This time slot is no longer available. Please choose another time."
                )

        return cleaned_data

    class Meta:
        model = Event
        fields = [
            "start_date",
            "start_time",
            "end_date",
            "end_time",
            "frequencies",
            "title",
            "email",
            "note",
            "end_recur",
            "user_timezone",
        ]
