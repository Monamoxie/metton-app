from datetime import time
from typing import Union

from identity.models.user import User
from event.exceptions import (
    InvalidWeeklyHoursError,
    OverrideAlreadyExistsError,
    OverrideNotFoundError,
    ScheduleNotFoundError,
)
from event.models import (
    Schedule,
    ScheduleBookingRules,
    ScheduleOverride,
    ScheduleWeeklyHours,
)


class ScheduleService:
    @staticmethod
    def get_default_for_user(user: User) -> Schedule:
        schedule = Schedule.objects.filter(user=user, is_default=True).first()
        if not schedule:
            raise ScheduleNotFoundError()
        return schedule

    @staticmethod
    def get_or_create_default_for_user(user: User) -> Schedule:
        schedule, _ = Schedule.objects.get_or_create(
            user=user,
            is_default=True,
            defaults={"name": "Working Hours", "timezone": "UTC"},
        )
        return schedule

    @staticmethod
    def replace_weekly_hours(
        schedule: Schedule, weekly_hours: list[dict]
    ) -> list[ScheduleWeeklyHours]:
        for entry in weekly_hours:
            start: time = entry["start_time"]
            end: time = entry["end_time"]
            if end <= start:
                raise InvalidWeeklyHoursError()

        ScheduleWeeklyHours.objects.filter(schedule=schedule).delete()
        created = ScheduleWeeklyHours.objects.bulk_create(
            [
                ScheduleWeeklyHours(
                    schedule=schedule,
                    day_of_week=entry["day_of_week"],
                    start_time=entry["start_time"],
                    end_time=entry["end_time"],
                )
                for entry in weekly_hours
            ]
        )
        return created

    @staticmethod
    def add_override(
        schedule: Schedule,
        date,
        is_unavailable: bool,
        start_time: Union[time, None] = None,
        end_time: Union[time, None] = None,
    ) -> ScheduleOverride:
        if ScheduleOverride.objects.filter(schedule=schedule, date=date).exists():
            raise OverrideAlreadyExistsError()

        return ScheduleOverride.objects.create(
            schedule=schedule,
            date=date,
            is_unavailable=is_unavailable,
            start_time=start_time,
            end_time=end_time,
        )

    @staticmethod
    def remove_override(schedule: Schedule, date) -> None:
        deleted, _ = ScheduleOverride.objects.filter(
            schedule=schedule, date=date
        ).delete()
        if not deleted:
            raise OverrideNotFoundError()

    @staticmethod
    def update_booking_rules(schedule: Schedule, **fields) -> ScheduleBookingRules:
        rules, _ = ScheduleBookingRules.objects.get_or_create(schedule=schedule)
        for field, value in fields.items():
            setattr(rules, field, value)
        rules.save()
        return rules
