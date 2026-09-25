from rest_framework import serializers

from event.serializers.schedule_booking_rules_serializer import (
    ScheduleBookingRulesSerializer,
)
from event.serializers.schedule_weekly_hours_serializer import (
    ScheduleWeeklyHoursSerializer,
)


class ScheduleUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(required=False, max_length=100)
    timezone = serializers.CharField(required=False, max_length=100)
    weekly_hours = ScheduleWeeklyHoursSerializer(many=True, required=False)
    booking_rules = ScheduleBookingRulesSerializer(required=False)
