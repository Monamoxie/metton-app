from typing import Any
from django.views.generic import TemplateView
from datetime import datetime
from dashboard.models.user import User
from dashboard.enums import RecurrenceTypes
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

        context_data["choices"] = RecurrenceTypes.options()
        context_data["public_id"] = public_id

        return context_data