from rest_framework import serializers

from event.enums import RepeatOption


class BookingCreateSerializer(serializers.Serializer):
    start_date = serializers.DateField()
    start_time = serializers.TimeField()
    end_date = serializers.DateField()
    end_time = serializers.TimeField()
    title = serializers.CharField(max_length=100, allow_blank=True, required=False, default="")
    email = serializers.EmailField()
    note = serializers.CharField(max_length=250, allow_blank=True, required=False, default="")
    user_timezone = serializers.CharField()
    repeat_type = serializers.ChoiceField(
        choices=[option.value for option in RepeatOption], default=RepeatOption.NO_REPEAT.value
    )
    days = serializers.ListField(
        child=serializers.ChoiceField(choices=[str(day) for day in range(7)]),
        required=False,
        default=list,
    )
    end_recur = serializers.DateField(required=False, allow_null=True)

    def validate(self, attrs):
        start_date = attrs["start_date"]
        end_date = attrs["end_date"]
        start_time = attrs["start_time"]
        end_time = attrs["end_time"]
        repeat_type = attrs["repeat_type"]
        end_recur = attrs.get("end_recur")

        if start_date == end_date and start_time >= end_time:
            raise serializers.ValidationError(
                {"start_time": "Start time must be before end time for same-day bookings."}
            )

        if repeat_type == RepeatOption.NO_REPEAT.value:
            if end_recur:
                raise serializers.ValidationError(
                    {"end_recur": "End recur date is only valid for a repeating booking."}
                )
        else:
            if not end_recur:
                raise serializers.ValidationError(
                    {"end_recur": "End recur date is required for a repeating booking."}
                )
            if end_recur < start_date:
                raise serializers.ValidationError(
                    {"end_recur": "End recur date must be after the start date."}
                )
            if repeat_type == RepeatOption.WEEKLY.value and not attrs.get("days"):
                raise serializers.ValidationError(
                    {"days": "Select at least one day for a weekly repeat."}
                )

        return attrs
