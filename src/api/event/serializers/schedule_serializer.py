from rest_framework import serializers

from event.models import Schedule
from event.serializers.schedule_booking_rules_serializer import (
    ScheduleBookingRulesSerializer,
)
from event.serializers.schedule_override_serializer import ScheduleOverrideSerializer
from event.serializers.schedule_weekly_hours_serializer import (
    ScheduleWeeklyHoursSerializer,
)


class ScheduleSerializer(serializers.ModelSerializer):
    weekly_hours = ScheduleWeeklyHoursSerializer(many=True, read_only=True)
    overrides = ScheduleOverrideSerializer(many=True, read_only=True)
    booking_rules = serializers.SerializerMethodField()

    class Meta:
        model = Schedule
        fields = [
            "id",
            "name",
            "timezone",
            "is_default",
            "weekly_hours",
            "overrides",
            "booking_rules",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_booking_rules(self, obj: Schedule):
        rules = getattr(obj, "booking_rules", None)
        if not rules:
            return None
        return ScheduleBookingRulesSerializer(rules).data
