import logging
import os
from zoneinfo import ZoneInfo

from core import settings
from event.enums import RecurrenceTypes
from event.exceptions import ScheduleNotFoundError
from event.models import Event
from event.services.booking_invite_service import BookingInviteService
from event.services.schedule_service import ScheduleService

logger = logging.getLogger(__name__)

EMAIL_TEMPLATE_DIR = os.path.join(settings.BASE_DIR, "event/templates/event/emails")


def send_booking_confirmation_emails(event: Event) -> bool:
    """Trigger booking confirmation emails (guest + host), each with an .ics invite, via
    Celery/RabbitMQ. Runs after the booking is committed, so a failure here is logged
    instead of failing a booking that has already been saved."""
    # Imported here: dashboard.tasks -> core.services -> event.services -> this module
    from dashboard.tasks import email_sender

    try:
        host = event.user
        host_name = host.name or host.email
        guest_emails = BookingInviteService.guest_emails(event)
        attachment = [
            BookingInviteService.FILENAME,
            BookingInviteService.build_ics(event, host_name, host.email),
            BookingInviteService.MIMETYPE,
        ]

        context = {
            "host_name": host_name,
            "host_email": host.email,
            "guest_emails": ", ".join(guest_emails),
            "title": event.title or f"Meeting with {host_name}",
            "note": event.note,
            "repeats": _describe_repeat(event),
        }

        email_sender.delay(
            f"Confirmed: {context['title']}",
            guest_emails,
            os.path.join(EMAIL_TEMPLATE_DIR, "booking_confirmation_guest.email.html"),
            {**context, "when": _describe_when(event, event.timezone)},
            [attachment],
        )
        email_sender.delay(
            f"New booking: {context['title']}",
            [host.email],
            os.path.join(EMAIL_TEMPLATE_DIR, "booking_confirmation_host.email.html"),
            {**context, "when": _describe_when(event, _host_timezone(event))},
            [attachment],
        )
    except Exception:
        logger.exception("Failed to send booking confirmation emails for %s", event.id)
        return False

    return True


def _host_timezone(event: Event) -> str:
    """The host reads the time in their own schedule's timezone, falling back to the one
    the guest booked in."""
    try:
        return ScheduleService.get_default_for_user(event.user).timezone
    except ScheduleNotFoundError:
        return event.timezone


def _describe_when(event: Event, timezone_name: str) -> str:
    display_tz = ZoneInfo(timezone_name)
    start, end = BookingInviteService.first_occurrence_window(event)
    start, end = start.astimezone(display_tz), end.astimezone(display_tz)

    if start.date() == end.date():
        span = f"{start:%A, %-d %B %Y}, {start:%H:%M} – {end:%H:%M}"
    else:
        span = f"{start:%A, %-d %B %Y %H:%M} – {end:%A, %-d %B %Y %H:%M}"

    return f"{span} ({timezone_name})"


def _describe_repeat(event: Event) -> str:
    days = BookingInviteService.recurring_days(event)
    if not days:
        return ""

    day_names = RecurrenceTypes.options()
    if len(days) == 7:
        label = "Every day"
    else:
        label = ", ".join(day_names[str(day)].replace("Every ", "") for day in days)
        label = f"Every {label}"

    return f"{label} until {event.end_recur:%-d %B %Y}"
