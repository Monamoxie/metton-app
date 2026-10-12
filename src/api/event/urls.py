from django.urls import path

from event.views import (
    BookingView,
    CreateBookingView,
    PublicProfileView,
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
    path(
        "<str:public_id>/public-profile/",
        PublicProfileView.as_view(),
        name="public-profile",
    ),
    path(
        "<str:public_id>/book/",
        CreateBookingView.as_view(),
        name="create-booking",
    ),
]
