from datetime import date, datetime, time, timedelta
from typing import List

import pytz

from event.exceptions import ScheduleNotFoundError
from event.models import ScheduleOverride
from event.services.availability_service import AvailabilityService
from event.services.booking_occurrence_service import BookingOccurrenceService
from event.services.booking_invite_service import BookingInviteService
from event.services.schedule_service import ScheduleService
from identity.models.user import User


class CalendarService:
    """What a host's own dashboard calendar shows for a date range: every occurrence of
    their bookings, plus the days their schedule marks as unavailable. All times are UTC;
    the browser renders them in the viewer's local time."""

    MAX_RANGE_DAYS = 366

    @staticmethod
    def get_bookings(user: User, start_date: date, end_date: date) -> List[dict]:
        # Widen by a day each side: occurrence dates are in each booking's own timezone,
        # which can sit a day either side of the viewer's once converted
        range_start = start_date - timedelta(days=1)
        range_end = end_date + timedelta(days=1)

        occurrences = []
        for booking in AvailabilityService.public_bookings_in_range(
            user, range_start, range_end, include_pending=True
        ):
            is_recurring = bool(BookingInviteService.recurring_days(booking))
            for occurrence in BookingOccurrenceService.occurrences_in_utc(
                booking.start_date,
                booking.start_time,
                booking.end_date,
                booking.end_time,
                booking.timezone,
                booking.frequency,
                booking.end_recur,
                range_start=range_start,
                range_end=range_end,
            ):
                occurrences.append(
                    {
                        "id": f"{booking.id}_{occurrence['start']:%Y%m%dT%H%M}",
                        "booking_id": booking.id,
                        "title": booking.title,
                        "start": occurrence["start"],
                        "end": occurrence["end"],
                        "attendees": BookingInviteService.guest_emails(booking),
                        "note": booking.note,
                        "timezone": booking.timezone,
                        "is_recurring": is_recurring,
                        "status": booking.status,
                    }
                )

        return sorted(occurrences, key=lambda occurrence: occurrence["start"])

    @staticmethod
    def get_unavailable(user: User, start_date: date, end_date: date) -> List[dict]:
        """Whole days blocked by the default schedule's overrides, as UTC ranges covering
        that day in the schedule's own timezone."""
        try:
            schedule = ScheduleService.get_default_for_user(user)
        except ScheduleNotFoundError:
            return []

        tz = pytz.timezone(schedule.timezone)
        overrides = ScheduleOverride.objects.filter(
            schedule=schedule,
            is_unavailable=True,
            date__range=(start_date - timedelta(days=1), end_date + timedelta(days=1)),
        ).order_by("date")

        return [
            {
                "date": override.date,
                "start": tz.localize(datetime.combine(override.date, time.min)).astimezone(
                    pytz.UTC
                ),
                "end": tz.localize(
                    datetime.combine(override.date + timedelta(days=1), time.min)
                ).astimezone(pytz.UTC),
            }
            for override in overrides
        ]
