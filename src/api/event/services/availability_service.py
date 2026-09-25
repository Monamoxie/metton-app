from datetime import date as date_cls
from datetime import datetime, timedelta
from typing import List

import pytz

from event.enums import EventTypes
from event.models import Event, Schedule, ScheduleOverride, ScheduleWeeklyHours


class AvailabilityService:
    """Turns a Schedule (weekly hours + date overrides + booking rules) into the actual list
    of bookable start times for a date range. Pure computation, no writes."""

    DEFAULT_MIN_NOTICE_MINUTES = 120
    DEFAULT_MAX_BOOKING_DAYS = 60
    DEFAULT_BUFFER_MINUTES = 0

    @classmethod
    def get_available_slots(
        cls,
        schedule: Schedule,
        start_date: date_cls,
        end_date: date_cls,
        duration_minutes: int,
    ) -> List[dict]:
        tz = pytz.timezone(schedule.timezone)
        now = datetime.now(tz)

        rules = getattr(schedule, "booking_rules", None)
        min_notice = rules.min_notice_minutes if rules else cls.DEFAULT_MIN_NOTICE_MINUTES
        max_booking_days = rules.max_booking_days if rules else cls.DEFAULT_MAX_BOOKING_DAYS
        buffer_before = rules.buffer_before_minutes if rules else cls.DEFAULT_BUFFER_MINUTES
        buffer_after = rules.buffer_after_minutes if rules else cls.DEFAULT_BUFFER_MINUTES
        daily_limit = rules.daily_booking_limit if rules else None
        allow_multiple_per_slot = rules.allow_multiple_per_slot if rules else False

        earliest_bookable = now + timedelta(minutes=min_notice)
        latest_bookable_date = now.date() + timedelta(days=max_booking_days)
        end_date = min(end_date, latest_bookable_date)

        overrides = {
            override.date: override
            for override in ScheduleOverride.objects.filter(
                schedule=schedule, date__range=(start_date, end_date)
            )
        }
        weekly_hours_by_day: dict = {}
        for entry in ScheduleWeeklyHours.objects.filter(schedule=schedule):
            weekly_hours_by_day.setdefault(entry.day_of_week, []).append(
                (entry.start_time, entry.end_time)
            )

        # Widen the booking lookup by a day on each side: a booking's start_date is stored
        # against *its own* recorded timezone (the booker's, not necessarily the host's), so
        # a booking that looks like it's on the day before/after `start_date`/`end_date` in
        # its own timezone can still land inside this range once converted to the host's.
        existing_bookings = cls._existing_bookings_in_utc(
            schedule, start_date - timedelta(days=1), end_date + timedelta(days=1)
        )

        # Bucket by the host's own local calendar date — the correct basis for both the
        # daily-limit count and for pairing bookings with the day they'd conflict with.
        bookings_by_host_date: dict = {}
        for booking in existing_bookings:
            host_date = booking["start"].astimezone(tz).date()
            bookings_by_host_date.setdefault(host_date, []).append(booking)

        slots = []
        current_date = start_date
        while current_date <= end_date:
            windows = cls._windows_for_date(current_date, overrides, weekly_hours_by_day)

            if windows:
                day_bookings = bookings_by_host_date.get(current_date, [])
                if daily_limit is None or len(day_bookings) < daily_limit:
                    for window_start, window_end in windows:
                        slots.extend(
                            cls._slots_for_window(
                                current_date,
                                window_start,
                                window_end,
                                duration_minutes,
                                tz,
                                earliest_bookable,
                                buffer_before,
                                buffer_after,
                                day_bookings,
                                allow_multiple_per_slot,
                            )
                        )

            current_date += timedelta(days=1)

        return slots

    @staticmethod
    def _existing_bookings_in_utc(schedule: Schedule, start_date, end_date) -> List[dict]:
        bookings = Event.objects.filter(
            user=schedule.user,
            type=EventTypes.PUBLIC.value,
            start_date__range=(start_date, end_date),
        )
        result = []
        for booking in bookings:
            booking_tz = pytz.timezone(booking.timezone)
            result.append(
                {
                    "start": booking_tz.localize(
                        datetime.combine(booking.start_date, booking.start_time)
                    ).astimezone(pytz.UTC),
                    "end": booking_tz.localize(
                        datetime.combine(booking.end_date, booking.end_time)
                    ).astimezone(pytz.UTC),
                }
            )
        return result

    @staticmethod
    def _windows_for_date(current_date, overrides, weekly_hours_by_day):
        override = overrides.get(current_date)
        if override:
            if override.is_unavailable:
                return []
            return [(override.start_time, override.end_time)]

        day_of_week = (current_date.weekday() + 1) % 7  # Python Mon=0 -> ours Sun=0
        return weekly_hours_by_day.get(day_of_week, [])

    @staticmethod
    def _slots_for_window(
        current_date,
        window_start,
        window_end,
        duration_minutes,
        tz,
        earliest_bookable,
        buffer_before,
        buffer_after,
        day_bookings,
        allow_multiple_per_slot,
    ) -> List[dict]:
        slots = []
        duration = timedelta(minutes=duration_minutes)
        cursor = tz.localize(datetime.combine(current_date, window_start))
        window_end_dt = tz.localize(datetime.combine(current_date, window_end))

        while cursor + duration <= window_end_dt:
            slot_start = cursor
            slot_end = cursor + duration

            if slot_start >= earliest_bookable:
                occupied_start = (slot_start - timedelta(minutes=buffer_before)).astimezone(
                    pytz.UTC
                )
                occupied_end = (slot_end + timedelta(minutes=buffer_after)).astimezone(
                    pytz.UTC
                )

                overlaps = False
                if not allow_multiple_per_slot:
                    for booking in day_bookings:
                        if occupied_start < booking["end"] and booking["start"] < occupied_end:
                            overlaps = True
                            break

                if not overlaps:
                    slots.append({"start": slot_start, "end": slot_end})

            cursor += duration

        return slots
