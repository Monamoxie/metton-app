from datetime import datetime, time
from datetime import timezone as dt_timezone
from typing import List, Tuple
from zoneinfo import ZoneInfo

from icalendar import Calendar, vCalAddress, vText
from icalendar import Event as CalendarEvent

from event.models import Event
from event.services.booking_occurrence_service import BookingOccurrenceService

# Index matches RecurrenceTypes (Sun=0 ... Sat=6), which is how Event.frequency stores days
ICS_DAY_CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"]


class BookingInviteService:
    """Builds the .ics calendar invite attached to booking confirmation emails."""

    FILENAME = "invite.ics"
    MIMETYPE = "text/calendar; method=REQUEST; charset=UTF-8"

    @classmethod
    def build_ics(cls, event: Event, organizer_name: str, organizer_email: str) -> str:
        tz = ZoneInfo(event.timezone)
        days = cls.recurring_days(event)
        start, end = cls.first_occurrence_window(event)

        calendar = Calendar()
        calendar.add("prodid", "-//Metton//Booking//EN")
        calendar.add("version", "2.0")
        calendar.add("method", "REQUEST")

        invite = CalendarEvent()
        invite.add("uid", f"{event.id}@metton")
        # Bump on reschedule/cancel so calendar clients replace this invite instead of duplicating it
        invite.add("sequence", 0)
        invite.add("status", "CONFIRMED")
        invite.add("dtstamp", datetime.now(dt_timezone.utc))
        invite.add("dtstart", start)
        invite.add("dtend", end)
        invite.add("summary", event.title or f"Meeting with {organizer_name}")
        if event.note:
            invite.add("description", event.note)

        if days:
            invite.add(
                "rrule",
                {
                    "freq": "WEEKLY",
                    "byday": [ICS_DAY_CODES[day] for day in days],
                    # RFC 5545: UNTIL must be UTC when DTSTART carries a TZID
                    "until": datetime.combine(event.end_recur, time.max, tzinfo=tz)
                    .astimezone(dt_timezone.utc)
                    .replace(microsecond=0),
                },
            )

        organizer = vCalAddress(f"mailto:{organizer_email}")
        organizer.params["cn"] = vText(organizer_name)
        invite.add("organizer", organizer)

        for guest_email in cls.guest_emails(event):
            attendee = vCalAddress(f"mailto:{guest_email}")
            attendee.params["role"] = vText("REQ-PARTICIPANT")
            # The guest picked this slot themselves, so it is already accepted on their side
            attendee.params["partstat"] = vText("ACCEPTED")
            attendee.params["rsvp"] = vText("FALSE")
            invite.add("attendee", attendee)

        calendar.add_component(invite)
        calendar.add_missing_timezones()

        return calendar.to_ical().decode("utf-8")

    @classmethod
    def first_occurrence_window(cls, event: Event) -> Tuple[datetime, datetime]:
        """Start/end of the booking's first real occurrence, timezone-aware in the booking's
        timezone. A repeating booking whose start_date isn't one of its repeat days first
        happens on the next matching day - the same way the dashboard calendar renders it."""
        tz = ZoneInfo(event.timezone)
        days = cls.recurring_days(event)

        first_date = event.start_date
        if days:
            first_date = BookingOccurrenceService.first_occurrence(event.start_date, days)
        # Multi-day bookings keep their length when the first occurrence moves forward
        shift = first_date - event.start_date

        return (
            datetime.combine(first_date, event.start_time, tzinfo=tz),
            datetime.combine(event.end_date + shift, event.end_time, tzinfo=tz),
        )

    @staticmethod
    def guest_emails(event: Event) -> List[str]:
        return [email.strip() for email in event.attendees.split(",") if email.strip()]

    @staticmethod
    def recurring_days(event: Event) -> List[int]:
        return BookingOccurrenceService.recurring_days(
            event.frequency, event.start_date, event.end_recur
        )
