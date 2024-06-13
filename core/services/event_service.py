import string
import time
import pytz
from datetime import datetime
import dateutil.parser
from django.db.models import Q
from typing import Union, List
from dashboard.models.user import User
from dashboard.models.event import Event
from dashboard.enums import EventTypes
from django.contrib.auth.models import AbstractBaseUser, AnonymousUser

class EventService:
    DEFAULT_TIMEZONE = "UTC"

    @staticmethod
    def get_event_title(event_type: str) -> Union[str, None]:
        try:
            return EventTypes(event_type).get_name()
        except ValueError:
            return None

    @classmethod
    def get_business_hours(
        cls, user: Union[AbstractBaseUser,AnonymousUser, None], public_id: Union[str, None] = None
    ) -> List[dict]:
        if public_id:
            user = User.objects.filter(public_id=public_id).first()

        if not user:
            return []

        events = Event.objects.filter(
            user=user, type=EventTypes.BUSINESS_HOURS.value
        ).order_by("created_at")

        data = []
        for event in events:
            # todo ::: #T000001
            """Reason for formatting this response as this:

            - The plugin rendering the calendar requires calendar data to be structured in this format:
            - We've got 2 options
            - Option 1:  structure it the way the calendar requires
            - Option 2: structure it as the backend stipulates, and let the Front end convert the data when it receives it
            
            - We've choosen to go with Option 1 as a temporary measure
            - Option 2 will be implemented later on, to ensure we maintain consistency with how responses are structured
            """
            event_data = {
                "id": event.id,
                "startTime": cls.convert_to_user_timezone(
                    str(event.start_date), str(event.start_time), event.timezone
                ),
                "endTime": cls.convert_to_user_timezone(
                    str(event.end_date), str(event.end_time), event.timezone
                ),
                "daysOfWeek": cls.get_week_indices_from_event(
                    event.frequency, event.start_date, event.start_time
                ),
            }
            data.append(event_data)

        return data

    @classmethod
    def convert_to_user_timezone(cls, date_str: str, time_str: str, user_timezone: str, time_only: bool = False):
        return cls.timezone_conversion(
            str(date_str), str(time_str), cls.DEFAULT_TIMEZONE, user_timezone, time_only
        )

    @classmethod
    def convert_to_utc(
        cls, date_str: str, time_str: str, user_timezone: str, time_only: bool = False
    ):
        return cls.timezone_conversion(
            str(date_str), str(time_str), user_timezone, cls.DEFAULT_TIMEZONE, time_only
        )

    @staticmethod
    def timezone_conversion(date_str: str, time_str: str, from_timezone: str, to_timezone: str, time_only: bool = False):
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

    @staticmethod
    def get_timetable_from_frequency(frequencies: Union[List, str], start_date: str, start_time: str, end_time: str, only_days: bool = False) -> List:
        days = EventService.get_days_of_week()
        timetable = []

        indices_list = (
            frequencies if type(frequencies) is list else frequencies.split(",")
        )

        for week_no in indices_list:
            if week_no:
                timetable.append(
                    [days[int(week_no)]]
                    if only_days
                    else [days[int(week_no)], start_time, end_time]
                )
            else:
                week_day = datetime.combine(start_date, start_time).strftime("%A")
                timetable.append(
                    [f"{week_day}, {start_date}"]
                    if only_days
                    else [f"{week_day}, {start_date}", start_time, end_time]
                )

        return timetable

    @staticmethod
    # todo :::  this should be moved into enums
    def get_days_of_week():
        return [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ]

    @staticmethod
    def get_week_indices_from_event(frequencies, start_date, start_time) -> List[str]: 
        """Prepare and return the indices of the days of week
        """
        if len(frequencies) == 1 and frequencies[0] == "":
            # to correctly dtermine the week_day, we need to factor in the start date + start time
            week_day = datetime.combine(start_date, start_time).strftime("%A")

            return [str(EventService.get_days_of_week().index(week_day))]
        return frequencies.split(",")

    @staticmethod
    def get_events(inputs, public_id=None) -> List:
        start_date = EventService.extract_start_date(inputs)
        end_date = EventService.extract_end_date(inputs)
        user = None

        if public_id:
            user = User.objects.filter(public_id=public_id).first()

        if not user:
            return []

        events = Event.objects.filter(Q(user=user),
            Q(start_date__gte=start_date, end_date__lte=end_date) |
            Q(end_recur__gte=start_date)
        ).exclude(type=EventTypes.BUSINESS_HOURS.value)

        return EventService.prep_event_data(events)

    @staticmethod
    def extract_start_date(params: List) -> str:
        start_date = params.get("start", str(datetime.now()))
        return dateutil.parser.parse(start_date).date() 

    @staticmethod
    def extract_end_date(params: List) -> Union[str, None]:
        end_date = params.get("end")
        if not end_date:
            return None  # Handle case where end date is not provided
        return dateutil.parser.parse(end_date).date()

    @staticmethod
    # todo ::: is this necessary, else deprecitate
    def extract_user_timezone(data):
        return data.get("utz", "UTC")

    @staticmethod
    # todo ::: to be reviewed
    def get_frequency(form_frequencies) -> str:
        if not form_frequencies:
            return ""

        frequencies = eval(form_frequencies) if isinstance(form_frequencies, str) else form_frequencies

        return ",".join(str(f) for f in frequencies if f != "no")

    @staticmethod
    def prep_event_data(events, format_date_time=False):
        data = []
        for event in events:
            event_data = {}
            event_data["id"] = str(event.id)
            event_data["title"] = str(event.title)

            start = EventService.convert_to_user_timezone(
                date_str=str(event.start_date),
                time_str=str(event.start_time),
                user_timezone=event.timezone,
            )
            event_data["start"] = start

            end = EventService.convert_to_user_timezone(
                date_str=str(event.end_date),
                time_str=str(event.end_time),
                user_timezone=event.timezone,
            )
            event_data["end"] = end

            frequencies = event.frequency.split(",") if event.frequency else []

            if frequencies and event.end_recur:
                event_data["daysOfWeek"] = frequencies
                event_data["startRecur"] = start
                event_data["endRecur"] = event.end_recur

            if format_date_time:
                event_data["start_time"] = start.strftime("%I:%M %p")
                event_data["start"] = start.strftime("%a, %d %b")
                event_data["end_time"] = end.strftime("%I:%M %p")
                event_data["end"] = end.strftime("%A, %d %B")

            tables = EventService.get_timetable_from_frequency(
                frequencies,
                event.start_date,
                EventService.convert_to_user_timezone(
                    date_str=str(event.start_date),
                    time_str=str(event.start_time),
                    user_timezone=event.timezone,
                    time_only=True,
                ),
                EventService.convert_to_user_timezone(
                    date_str=str(event.end_date),
                    time_str=str(event.end_time),
                    user_timezone=event.timezone,
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
