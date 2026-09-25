from django.urls import path

from event.views import (
    BookingView,
    ScheduleDetailView,
    ScheduleOverrideView,
    UserAvailableSlotsView,
)

urlpatterns = [
    path("<str:public_id>/book", BookingView.as_view(), name="book"),
    path("schedule/", ScheduleDetailView.as_view(), name="schedule-detail"),
    path(
        "schedule/overrides/",
        ScheduleOverrideView.as_view(),
        name="schedule-override-create",
    ),
    path(
        "schedule/overrides/<str:date>/",
        ScheduleOverrideView.as_view(),
        name="schedule-override-delete",
    ),
    path(
        "<str:public_id>/slots/",
        UserAvailableSlotsView.as_view(),
        name="user-available-slots",
    ),
]
