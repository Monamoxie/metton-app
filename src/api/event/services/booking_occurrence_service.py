from datetime import date, datetime, time, timedelta
from typing import List, Optional

import pytz


class BookingOccurrenceService:
    """Expands a booking - one-off or repeating - into the concrete times it actually takes
    up. A repeating booking happens on each of its `frequency` days (Sun=0) from start_date
    through end_recur inclusive, starting with the first matching day on/after start_date."""

    @staticmethod
    def first_occurrence(start_date: date, days: List[int]) -> Optional[date]:
        """First date on/after start_date that falls on one of `days` (Sun=0)."""
        for offset in range(7):
            candidate = start_date + timedelta(days=offset)
            if (candidate.weekday() + 1) % 7 in days:  # Python Mon=0 -> ours Sun=0
                return candidate
        return None

    @classmethod
    def recurring_days(
        cls, frequency: str, start_date: date, end_recur: Optional[date]
    ) -> List[int]:
        """Weekdays (Sun=0) the booking repeats on, or [] when it is a one-off. A repeat whose
        days never fall on or before end_recur has no real occurrences, so it is treated as
        a one-off on its start date."""
        if not frequency or not end_recur:
            return []

        days = sorted({int(day) for day in frequency.split(",") if day.strip()})
        first = cls.first_occurrence(start_date, days)
        if first is None or first > end_recur:
            return []

        return days

    @classmethod
    def occurrence_dates(
        cls,
        start_date: date,
        frequency: str = "",
        end_recur: Optional[date] = None,
        range_start: Optional[date] = None,
        range_end: Optional[date] = None,
    ) -> List[date]:
        """Start dates of each occurrence, in the booking's own timezone, optionally limited
        to those falling within [range_start, range_end]."""
        days = cls.recurring_days(frequency, start_date, end_recur)
        if not days:
            dates = [start_date]
        else:
            current = cls.first_occurrence(start_date, days)
            last = end_recur
            if range_start and range_start > current:
                current = range_start
            if range_end and range_end < last:
                last = range_end

            dates = []
            while current <= last:
                if (current.weekday() + 1) % 7 in days:
                    dates.append(current)
                current += timedelta(days=1)

        return [
            occurrence
            for occurrence in dates
            if (range_start is None or occurrence >= range_start)
            and (range_end is None or occurrence <= range_end)
        ]

    @classmethod
    def occurrences_in_utc(
        cls,
        start_date: date,
        start_time: time,
        end_date: date,
        end_time: time,
        timezone_name: str,
        frequency: str = "",
        end_recur: Optional[date] = None,
        range_start: Optional[date] = None,
        range_end: Optional[date] = None,
    ) -> List[dict]:
        """[{"start", "end"}] in UTC for each occurrence. Multi-day bookings keep their
        length on every occurrence."""
        tz = pytz.timezone(timezone_name)
        length = end_date - start_date

        return [
            {
                "start": tz.localize(datetime.combine(occurrence, start_time)).astimezone(
                    pytz.UTC
                ),
                "end": tz.localize(
                    datetime.combine(occurrence + length, end_time)
                ).astimezone(pytz.UTC),
            }
            for occurrence in cls.occurrence_dates(
                start_date, frequency, end_recur, range_start, range_end
            )
        ]
