from django.urls import path
from .views import DashboardView
from event.views import (
    ScheduleManagerView,
    EventListView,
    EventDeleteView,
    EventListBusinessHoursView,
    EventDeleteBusinessHoursView,
)

urlpatterns = [
    path("", DashboardView.as_view(), name="dashboard"),
    path("manage/schedule", ScheduleManagerView.as_view(), name="schedule-manager"),
    path("events", EventListView.as_view(), name="events"),
    path("events/detach", EventDeleteView.as_view(), name="event-delete"),
    path(
        "events/business-hours",
        EventListBusinessHoursView.as_view(),
        name="business-hours",
    ),
    path(
        "events/business-hours/detach",
        EventDeleteBusinessHoursView.as_view(),
        name="delete-business-hours",
    ),
]
