from django.urls import path
from .views import (
    ProfileUpdateView,
    PasswordUpdateView,
    ScheduleManagerView,
    DashboardView,
    EventListView,
    EventDeleteView,
    EventListBusinessHoursView,
    EventDeleteBusinessHoursView,
    LogoutView,
)

urlpatterns = [
    path("", DashboardView.as_view(), name="dashboard"),
    path("profile-update", ProfileUpdateView.as_view(), name="profile-update"),
    path("password-update", PasswordUpdateView.as_view(), name="password-update"),
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
    path("logout", LogoutView.as_view(), name="logout"),
]
