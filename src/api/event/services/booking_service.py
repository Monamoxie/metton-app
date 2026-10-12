from typing import Any

from event.enums import EventTypes, RepeatOption
from event.exceptions import BookingConflictError, ScheduleNotFoundError
from event.models import Event
from event.services.availability_service import AvailabilityService
from event.services.schedule_service import ScheduleService
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
        buffer_before = 0
        buffer_after = 0
        try:
            schedule = ScheduleService.get_default_for_user(host)
            rules = getattr(schedule, "booking_rules", None)
            if rules:
                allow_multiple = rules.allow_multiple_per_slot
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
        ):
            raise BookingConflictError()

        return Event.objects.create(
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
        )
