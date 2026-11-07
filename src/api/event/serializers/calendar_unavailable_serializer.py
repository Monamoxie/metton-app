from rest_framework import serializers


class CalendarUnavailableSerializer(serializers.Serializer):
    date = serializers.DateField()
    start = serializers.DateTimeField()
    end = serializers.DateTimeField()
