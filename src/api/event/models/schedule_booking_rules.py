from django.db import models

from event.models.schedule import Schedule


class ScheduleBookingRules(models.Model):
    schedule = models.OneToOneField(
        Schedule, on_delete=models.CASCADE, related_name="booking_rules"
    )
    # How soon before a slot can it still be booked? Default 2 hours.
    min_notice_minutes = models.IntegerField(default=120)
    # How far in the future can someone book? Default 60 days.
    max_booking_days = models.IntegerField(default=60)
    buffer_before_minutes = models.IntegerField(default=0)
    buffer_after_minutes = models.IntegerField(default=0)
    # null = no daily cap.
    daily_booking_limit = models.IntegerField(null=True, blank=True)
    allow_multiple_per_slot = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "event_schedule_booking_rules"

    def __str__(self):
        return f"Booking rules for {self.schedule}"
