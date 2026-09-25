from django.contrib import admin
from event.models import (
    Event,
    Schedule,
    ScheduleBookingRules,
    ScheduleOverride,
    ScheduleWeeklyHours,
)

admin.site.register(Event)
admin.site.register(Schedule)
admin.site.register(ScheduleWeeklyHours)
admin.site.register(ScheduleOverride)
admin.site.register(ScheduleBookingRules)
