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
            event_data["daysOfWeek"] = frequencies
            days = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednessday",
                "Thursday",
                "Friday",
                "Saturday",
            ]

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

            timetable = []
            if len(frequencies) > 0:
                for week_no in frequencies:
                    entry = []
                    if week_no:
                        entry.append(days[int(week_no)])
                        entry.append(start_time)
                        entry.append(end_time)

                        timetable.append(entry)
                    else:
                        week_day = datetime.combine(
                            event.start_date, event.start_time
                        ).strftime("%A")

                        event_data["daysOfWeek"] = [str(days.index(week_day))]

                        entry.append(f"{week_day + ', ' + str(event.start_date)}")
                        entry.append(start_time)
                        entry.append(end_time)

                        timetable.append(entry)

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
