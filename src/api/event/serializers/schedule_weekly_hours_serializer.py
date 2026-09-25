from rest_framework import serializers

from core.message_bag import MessageBag


class ScheduleWeeklyHoursSerializer(serializers.Serializer):
    day_of_week = serializers.IntegerField(
        min_value=0,
        max_value=6,
        error_messages={
            "required": MessageBag.FIELD_IS_REQUIRED.format(field="day_of_week")
        },
    )
    start_time = serializers.TimeField(
        error_messages={"required": MessageBag.FIELD_IS_REQUIRED.format(field="start_time")}
    )
    end_time = serializers.TimeField(
        error_messages={"required": MessageBag.FIELD_IS_REQUIRED.format(field="end_time")}
    )
