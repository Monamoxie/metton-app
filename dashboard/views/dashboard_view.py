from dashboard.models import Event
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.messages.views import SuccessMessageMixin
from django.urls import reverse_lazy
from django.views.generic import FormView
from core.services.event_service import EventService
from dashboard.enums import EventTypes
from dashboard.forms_legacy import ScheduleManagerForm
from typing import Any
from datetime import datetime
from django.contrib import messages
from django.shortcuts import redirect
from dashboard.models.user import User


class DashboardView(LoginRequiredMixin, SuccessMessageMixin, FormView):
    form_class = ScheduleManagerForm
    succeess_url = reverse_lazy("password-update")
    success_message = "Your schedule has been updated!"
    template_name = "dashboard/index.html"

    def get_context_data(self, **kwargs) -> dict[str, Any]:
        """Include some extra data, before passing it over to the template"""
        context = super().get_context_data(**kwargs)

        context["choices"] = EventTypes.options()
        context["weekday_num"] = datetime.now().isoweekday()
        context["business_hours"] = EventService.get_business_hours(
            user=self.request.user
        )
        context["display_name"] = getattr(self.request.user, "name", "")
        context["position"] = getattr(self.request.user, "position", "")

        appointments = Event.objects.filter(
            start_date__gte=datetime.now().date(),
            type=EventTypes.PUBLIC.value,
        ).order_by("start_date", "start_time")[:7]
        upcoming_appointments = EventService.prep_event_data(
            appointments, format_date_time=True
        )

        context["upcoming_appointments"] = upcoming_appointments
        context["next_appointment"] = (
            upcoming_appointments.pop(0) if len(upcoming_appointments) > 0 else {}
        )

        return context

    def form_valid(self, form):
        type_input_value = (
            str(form.cleaned_data["type"])
            if "type" in form.cleaned_data
            else EventTypes.BUSINESS_HOURS.value
        )
        user_timezone = EventService.extract_user_timezone(form.data)

        start_date = form.cleaned_data["start_date"]
        start_time = EventService.convert_to_utc(
            date_str=str(start_date),
            time_str=str(form.cleaned_data["start_time"]),
            user_timezone=user_timezone,
        )

        end_date = form.cleaned_data["end_date"]
        end_time = EventService().convert_to_utc(
            date_str=str(end_date),
            time_str=str(form.cleaned_data["end_time"]),
            user_timezone=user_timezone,
        )

        frequency = EventService.get_frequency(form.cleaned_data["frequency"])

        if start_time == None or end_time == None:
            messages.error(
                self.request,
                "Start time/End time could not be processed. Please ensure the correct slots were selected",
            )
            return self.form_invalid(form)

        if frequency == "" and (start_date == end_date and start_time > end_time):
            messages.error(
                self.request,
                "Start time cannot be greater than End time, when start date and end date are the same",
            )
            return self.form_invalid(form)

        title = EventService.get_event_title(type_input_value)
        event = Event(
            frequency=EventService().get_frequency(form.cleaned_data["frequency"]),
            user=self.request.user,
            title=title,
            type=type_input_value,
            start_date=start_date,
            start_time=start_time,
            end_date=end_date,
            end_time=end_time,
            timezone=user_timezone,
        )

        event.save()
        messages.success(self.request, "Your schedule has been updated!")
        return redirect("schedule-manager")

    def form_invalid(self, form):
        messages.error(self.request, form.errors)
        return super().form_invalid(form)
