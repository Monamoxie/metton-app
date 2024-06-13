from tkinter import EventType
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.messages.views import SuccessMessageMixin
from dashboard.forms import ScheduleManagerForm
from django.views.generic.edit import FormView
from django.urls import reverse_lazy
from core.services import EventService
from dashboard.models import Event
from datetime import datetime
from django.contrib import messages
from dashboard.enums import EventTypes, RecurrenceTypes


class ScheduleManagerView(LoginRequiredMixin, SuccessMessageMixin, FormView):
    template_name = "dashboard/schedule_manager.html"
    form_class = ScheduleManagerForm
    success_url = reverse_lazy("schedule_manager")

    def get_context_data(self, **kwargs):
        """Include some extra data, before passing it over to the template"""
        context = super().get_context_data(**kwargs)
        context["choices"] = RecurrenceTypes.options()
        context["weekday_num"] = datetime.now().isoweekday()
        context["business_hours"] = EventService.get_business_hours(
            user=self.request.user
        )
        context["display_name"] = self.request.user.name
        context["position"] = self.request.user.position
        return context

    def form_valid(self, form):
        user_time_zone = EventService().extract_user_timezone(form.data)
        start_date = form.cleaned_data["start_date"]
        start_time = EventService().timezone_conversion(
            date_str=str(start_date),
            time_str=str(form.cleaned_data["start_time"]),
            from_timezone=user_time_zone,
            to_timezone="UTC",
        )
        end_date = form.cleaned_data["end_date"]
        end_time = EventService().timezone_conversion(
            date_str=str(end_date),
            time_str=str(form.cleaned_data["end_time"]),
            from_timezone=user_time_zone,
            to_timezone="UTC",
        )
        frequency = EventService().get_frequency(form.cleaned_data["frequency"])

        if start_time is None or end_time is None:
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

        type_input = form.cleaned_data.get("type", EventTypes.BUSINESS_HOURS.value)
        title = EventTypes.get_name_by_value(type_input)

        event = Event(
            frequency=frequency,
            user=self.request.user,
            title=title,
            type=type_input,
            start_date=start_date,
            start_time=start_time,
            end_date=end_date,
            end_time=end_time,
            timezone=user_time_zone,
        )

        event.save()
        messages.success(self.request, "Your schedule has been updated!")
        return super().form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, form.errors)
        return super().form_invalid(form)
