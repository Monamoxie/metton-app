import string
import time
from typing import Any
from django.db import models
import dashboard
import pytz
from datetime import datetime
from datetime import timedelta
import dateutil.parser
from django.db.models import Q

from dashboard.models.user import User
from dashboard.models.event import Event
from dashboard.enums import EventTypes


class EventService(Event):
    def get_event_title(type):
        if type == 2:
            return EventTypes.BUSINESS_HOURS.get_name()
        else:
            return EventTypes.UNAVAILABLE.get_name()

    def get_business_hours(self, user, public_id=None):
        if public_id is not None:
            user = User.objects.filter(public_id=public_id).first()
        else:
            user = user

        if not user:
            return []

        events = Event.objects.filter(
            user=user, type=EventTypes.BUSINESS_HOURS.value
        ).order_by("created_at")

        data = []
        for event in events:
            event_data = {}

            frequencies = event.frequency.split(",") if event.frequency != "" else ""

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

                    if just_days == False:
                        entry.append(f"{week_day + ', ' + str(start_date)}")
                        entry.append(start_time)
                        entry.append(end_time)
                    else:
                        entry.append(week_day)
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

    def get_events(self, inputs, public_id=None):
        start_date = self.get_start_date(inputs)
        end_date = self.get_end_date(inputs)

        if public_id is not None:
            user = User.objects.filter(public_id=public_id).first()
        else:
            user = user

        if not user:
            return []

        events = (
            Event.objects.filter(
                user=user,
            )
            .filter(
                (Q(start_date__gte=start_date) & Q(end_date__lte=end_date))
                | (Q(end_recur__gte=start_date))
            )
            .exclude(type=EventTypes.BUSINESS_HOURS.value)
        )

        return self.prep_event_data(events)

    def get_start_date(self, params):
        if "start" in params:
            start_date = str(params["start"])
        else:
            start_date = str(datetime.now())

        return str(dateutil.parser.parse(start_date).date())

    def get_end_date(self, params):
        if "end" in params:
            end_date = str(params["end"])
        else:
            pass
            # end_date = str(datetime.now() + timedelta(days=30))

        return str(dateutil.parser.parse(end_date).date())

    def extract_user_timezone(self, data):
        if "utz" in data and data["utz"]:
            return data["utz"]
        return "UTC"

    def get_frequency(self, form_frequencies):
        frequency = ""
        if form_frequencies is not None:
            form_frequencies = (
                eval(form_frequencies)
                if isinstance(form_frequencies, str)
                else form_frequencies
            )
            for f in form_frequencies:
                if f != "no":
                    prepender = (
                        ","
                        if len(form_frequencies) != (form_frequencies.index(f) + 1)
                        else ""
                    )
                    frequency += str(f) + prepender

        return frequency

    def prep_event_data(self, events, format_date_time=False):
        data = []
        for event in events:
            event_data = {}
            event_data["id"] = str(event.id)
            event_data["title"] = str(event.title)

            start = self.timezone_conversion(
                date_str=str(event.start_date),
                time_str=str(event.start_time),
                from_timezone="UTC",
                to_timezone=event.timezone,
                time_only=False,
            )

            event_data["start"] = start

            end = self.timezone_conversion(
                date_str=str(event.end_date),
                time_str=str(event.end_time),
                from_timezone="UTC",
                to_timezone=event.timezone,
                time_only=False,
            )

            event_data["end"] = end

            frequencies = event.frequency.split(",") if event.frequency != "" else ""

            if len(frequencies) > 0 and event.end_recur is not None:
                event_data["daysOfWeek"] = frequencies
                event_data["startRecur"] = start
                event_data["endRecur"] = event.end_recur

            if format_date_time:
                event_data["start_time"] = start.strftime("%I:%M %p")
                event_data["start"] = start.strftime("%a, %d %b")

            if format_date_time:
                event_data["end_time"] = end.strftime("%I:%M %p")
                event_data["end"] = end.strftime("%A, %d %B")

            tables = self.get_timetable_from_frequency(
                frequencies,
                event.start_date,
                self.timezone_conversion(
                    date_str=str(event.start_date),
                    time_str=str(event.start_time),
                    from_timezone="UTC",
                    to_timezone=event.timezone,
                    time_only=True,
                ),
                self.timezone_conversion(
                    date_str=str(event.end_date),
                    time_str=str(event.end_time),
                    from_timezone="UTC",
                    to_timezone=event.timezone,
                    time_only=True,
                ),
                True,
            )

            timetable = []
            for table in tables:
                timetable.append(f"{table[0] + 's'}")

            timetable = "".join(timetable)

            event_data["timetable"] = timetable

            if event.type == EventTypes.UNAVAILABLE.value:
                event_data["display"] = "background"
                event_data["backgroundColor"] = "#502c3c"
                event_data["color"] = "#c0c0c0"
                event_data["classNames"] = "fc-unavailable"

            event_data = dict(event_data)
            data.append(event_data)

        return data
