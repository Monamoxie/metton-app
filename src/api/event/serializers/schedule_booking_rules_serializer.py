from rest_framework import serializers


class ScheduleBookingRulesSerializer(serializers.Serializer):
    min_notice_minutes = serializers.IntegerField(required=False, min_value=0)
    max_booking_days = serializers.IntegerField(required=False, min_value=1)
    buffer_before_minutes = serializers.IntegerField(required=False, min_value=0)
    buffer_after_minutes = serializers.IntegerField(required=False, min_value=0)
    daily_booking_limit = serializers.IntegerField(
        required=False, allow_null=True, min_value=1
    )
    allow_multiple_per_slot = serializers.BooleanField(required=False)
