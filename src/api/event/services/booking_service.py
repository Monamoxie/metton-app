from typing import Any

from django.db import transaction

from event.enums import BookingStatus, EventTypes, RepeatOption
from event.exceptions import (
    BookingConflictError,
    BookingNotPendingError,
    ScheduleNotFoundError,
)
from event.models import Event, ScheduleBookingRules
from event.services.availability_service import AvailabilityService
from event.services.schedule_service import ScheduleService
from event.utils import (
    send_booking_confirmation_emails,
    send_booking_declined_email,
    send_booking_request_emails,
)
from identity.models.user import User

ALL_DAYS = [str(day) for day in range(7)]


class BookingService:
    """Validates and creates a guest's PUBLIC booking against a host's schedule."""

    @staticmethod
    def resolve_frequency(repeat_type: str, days: list[str]) -> str:
        if repeat_type == RepeatOption.DAILY.value:
            return ",".join(ALL_DAYS)
        if repeat_type == RepeatOption.WEEKLY.value:
            return ",".join(days)
        return ""

    @classmethod
    def create_booking(cls, host: User, validated_data: dict[str, Any]) -> Event:
        frequency = cls.resolve_frequency(
            validated_data["repeat_type"], validated_data.get("days", [])
        )

        allow_multiple = False
        requires_approval = False
        buffer_before = 0
        buffer_after = 0
        try:
            schedule = ScheduleService.get_default_for_user(host)
            rules = getattr(schedule, "booking_rules", None)
            if rules:
                allow_multiple = rules.allow_multiple_per_slot
                requires_approval = rules.requires_approval
                buffer_before = rules.buffer_before_minutes
                buffer_after = rules.buffer_after_minutes
        except ScheduleNotFoundError:
            pass

        if not allow_multiple and AvailabilityService.has_conflicting_booking(
            host,
            validated_data["start_date"],
            validated_data["start_time"],
            validated_data["end_date"],
            validated_data["end_time"],
            validated_data["user_timezone"],
            buffer_before,
            buffer_after,
            frequency,
            validated_data.get("end_recur"),
        ):
            raise BookingConflictError()

        booking = Event.objects.create(
            user=host,
            title=validated_data.get("title", ""),
            start_date=validated_data["start_date"],
            start_time=validated_data["start_time"],
            end_date=validated_data["end_date"],
            end_time=validated_data["end_time"],
            frequency=frequency,
            type=EventTypes.PUBLIC.value,
            note=validated_data.get("note", ""),
            timezone=validated_data["user_timezone"],
            attendees=validated_data["email"],
            end_recur=validated_data.get("end_recur"),
            status=(
                BookingStatus.PENDING.value
                if requires_approval
                else BookingStatus.CONFIRMED.value
            ),
        )

        if requires_approval:
            transaction.on_commit(lambda: send_booking_request_emails(booking))
        else:
            transaction.on_commit(lambda: send_booking_confirmation_emails(booking))

        return booking

    @classmethod
    def accept_booking(cls, booking: Event) -> Event:
        """Confirm a pending booking. The slot may have been taken since it was requested
        (pending bookings don't block), so the conflict check runs again."""
        cls._require_pending(booking)

        rules = cls._booking_rules(booking.user)
        if not rules.allow_multiple_per_slot and AvailabilityService.has_conflicting_booking(
            booking.user,
            booking.start_date,
            booking.start_time,
            booking.end_date,
            booking.end_time,
            booking.timezone,
            rules.buffer_before_minutes,
            rules.buffer_after_minutes,
            booking.frequency,
            booking.end_recur,
        ):
            raise BookingConflictError()

        booking.status = BookingStatus.CONFIRMED.value
        booking.save(update_fields=["status"])
        transaction.on_commit(lambda: send_booking_confirmation_emails(booking))

        return booking

    @classmethod
    def decline_booking(cls, booking: Event) -> Event:
        cls._require_pending(booking)

        booking.status = BookingStatus.DECLINED.value
        booking.save(update_fields=["status"])
        transaction.on_commit(lambda: send_booking_declined_email(booking))

        return booking

    @staticmethod
    def _require_pending(booking: Event) -> None:
        if booking.status != BookingStatus.PENDING.value:
            raise BookingNotPendingError()

    @staticmethod
    def _booking_rules(host: User) -> ScheduleBookingRules:
        """The host's booking rules, or an unsaved all-defaults set when they have none."""
        try:
            rules = getattr(ScheduleService.get_default_for_user(host), "booking_rules", None)
        except ScheduleNotFoundError:
            rules = None
        return rules or ScheduleBookingRules()
