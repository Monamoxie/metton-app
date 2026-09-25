from django.db import models

from event.models.schedule import Schedule


class ScheduleOverride(models.Model):
    schedule = models.ForeignKey(
        Schedule, on_delete=models.CASCADE, related_name="overrides"
    )
    date = models.DateField()
    # True: the whole day is blocked (holiday/PTO). False: custom one-off hours for
    # this date only, held in start_time/end_time instead of the weekly pattern.
    is_unavailable = models.BooleanField(default=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "event_schedule_overrides"
        unique_together = ("schedule", "date")

    def __str__(self):
        return f"{self.schedule} - {self.date} ({'unavailable' if self.is_unavailable else 'custom hours'})"
