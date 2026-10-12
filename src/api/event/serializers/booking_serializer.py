from rest_framework import serializers


class BookingSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    title = serializers.CharField()
    start_date = serializers.DateField()
    start_time = serializers.TimeField()
    end_date = serializers.DateField()
    end_time = serializers.TimeField()
    frequency = serializers.CharField()
    end_recur = serializers.DateField(allow_null=True)
