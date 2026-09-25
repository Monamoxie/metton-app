from django.db import models

from event.models.schedule import Schedule


class ScheduleWeeklyHours(models.Model):
    # Matches RecurrenceTypes' day numbering: 0=Sunday .. 6=Saturday.
    schedule = models.ForeignKey(
        Schedule, on_delete=models.CASCADE, related_name="weekly_hours"
    )
    day_of_week = models.IntegerField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "event_schedule_weekly_hours"

    def __str__(self):
        return f"{self.schedule} - day {self.day_of_week} {self.start_time}-{self.end_time}"
