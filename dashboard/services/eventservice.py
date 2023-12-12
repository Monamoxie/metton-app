import time
from typing import Any
from django.db import models
import dashboard
import pytz
from datetime import datetime

from dashboard.models import Event


class EventService(Event):
    def get_event_title(type):
        if type == 2:
            return Event.EventTypes.BUSINESS_HOURS.name.replace("_", " ")
        else:
            return Event.EventTypes.UNAVAILABLE.name

    def get_business_hours(self, request):
        events = Event.objects.filter(
            user=request.user, type=Event.EventTypes.BUSINESS_HOURS
        ).order_by("created_at")

        data = []
        for event in events:
            event_data = {}

            frequencies = event.frequency.split(",")

            event_data["id"] = event.id

            start_time = self.timezone_conversion(
                date_str=str(event.start_date),
                time_str=str(event.start_time),
                from_timezone="UTC",
                to_timezone=event.timezone,
            )

            end_time = self.timezone_conversion(
                date_str=str(event.end_date),
                time_str=str(event.end_time),
                from_timezone="UTC",
                to_timezone=event.timezone,
            )

            event_data["startTime"] = start_time
            event_data["endTime"] = end_time

            event_data["daysOfWeek"] = self.prep_frequency(
                frequencies, event.start_date, start_time
            )

            timetable = self.get_timetable_from_frequency(
                frequencies, event.start_date, start_time, end_time
            )

            event_data["timetable"] = timetable

            event_data = dict(event_data)
            data.append(event_data)

        return data

    def timezone_conversion(
        self,
        date_str: str,
        time_str=str,
        from_timezone=str,
        to_timezone=str,
        time_only=True,
    ):
        from_timezone = pytz.timezone(from_timezone)
        to_timezone = pytz.timezone(to_timezone)

        date_list = date_str.split("-")
        time_list = time_str.split(":")

        if len(date_list) == 3 and len(time_list) == 3:
            selected_dt = datetime(
                year=int(date_list[0]),
                month=int(date_list[1]),
                day=int(date_list[2]),
                hour=int(time_list[0]),
                minute=int(time_list[1]),
                second=int(time_list[2]),
            )
            user_timezone_aware = from_timezone.localize(selected_dt)

            if time_only:
                return user_timezone_aware.astimezone(to_timezone).time()

            return user_timezone_aware.astimezone(to_timezone)

        return None

    def get_timetable_from_frequency(
        self, frequencies, start_date, start_time, end_time, just_days=False
    ):
        days = self.get_days_of_week()

        timetable = []
        if len(frequencies) > 0:
            for week_no in frequencies:
                entry = []
                if week_no:
                    entry.append(days[int(week_no)])

                    if just_days == False:
                        entry.append(start_time)
                        entry.append(end_time)

                    timetable.append(entry)
                else:
                    week_day = datetime.combine(start_date, start_time).strftime("%A")

                    entry.append(f"{week_day + ', ' + str(start_date)}")
                    if just_days == False:
                        entry.append(start_time)
                        entry.append(end_time)

                    timetable.append(entry)

        return timetable

    def get_days_of_week(self):
        return [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednessday",
            "Thursday",
            "Friday",
            "Saturday",
        ]

    def prep_frequency(self, frequencies, start_date, start_time):
        """
        - check for non recurring events
        """
        if len(frequencies) == 1 and frequencies[0] == "":
            week_day = datetime.combine(start_date, start_time).strftime("%A")

            return [str(self.get_days_of_week().index(week_day))]

        return frequencies
