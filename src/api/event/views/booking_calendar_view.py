from typing import Any
from django.views.generic import TemplateView
from datetime import datetime
from identity.models.user import User
from event.enums import RecurrenceTypes, RepeatOption
from django.shortcuts import render, get_object_or_404
from core import settings
from django.utils import timezone


class BookingCalendarView(TemplateView):
    template_name = "home/meet.html"

    def get_context_data(self, **kwargs: Any) -> dict[str, Any]:
        context_data = super().get_context_data(**kwargs)

        public_id = kwargs.get("public_id")
        context_data["user"] = get_object_or_404(User, public_id=public_id)

        today = datetime.today()
        context_data["first_day_of_month"] = today.strftime("%Y-%m-01")

        context_data["repeat_choices"] = RepeatOption.options()
        day_choices = RecurrenceTypes.options()
        day_choices.pop(RecurrenceTypes.NO_REPEAT.value, None)
        context_data["day_choices"] = day_choices
        context_data["public_id"] = public_id

        return context_data
