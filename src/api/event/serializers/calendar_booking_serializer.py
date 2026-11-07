from rest_framework import serializers


class CalendarBookingSerializer(serializers.Serializer):
    """One occurrence of a booking. Repeating bookings appear once per occurrence, all
    sharing the same booking_id."""

    id = serializers.CharField()
    booking_id = serializers.UUIDField()
    title = serializers.CharField(allow_blank=True)
    start = serializers.DateTimeField()
    end = serializers.DateTimeField()
    attendees = serializers.ListField(child=serializers.EmailField())
    note = serializers.CharField(allow_blank=True)
    timezone = serializers.CharField()
    is_recurring = serializers.BooleanField()
