from rest_framework import serializers

from core.message_bag import MessageBag


class ScheduleOverrideSerializer(serializers.Serializer):
    date = serializers.DateField(
        error_messages={"required": MessageBag.FIELD_IS_REQUIRED.format(field="date")}
    )
    is_unavailable = serializers.BooleanField(default=True)
    start_time = serializers.TimeField(required=False, allow_null=True)
    end_time = serializers.TimeField(required=False, allow_null=True)

    def validate(self, attrs):
        if not attrs.get("is_unavailable", True):
            if not attrs.get("start_time") or not attrs.get("end_time"):
                raise serializers.ValidationError(
                    "start_time and end_time are required when is_unavailable is false"
                )
            if attrs["end_time"] <= attrs["start_time"]:
                raise serializers.ValidationError(
                    MessageBag.DATA_IS_INVALID.format(data="end_time")
                )
        return attrs
