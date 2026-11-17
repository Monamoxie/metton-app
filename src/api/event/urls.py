from django.urls import path

from event.views import (
    BookingDecisionView,
    BookingView,
    CalendarView,
    CreateBookingView,
    PublicProfileView,
    ScheduleDetailView,
    ScheduleOverrideView,
    UserAvailableSlotsView,
)

urlpatterns = [
    path("<str:public_id>/book", BookingView.as_view(), name="book"),
    path("schedule/", ScheduleDetailView.as_view(), name="schedule-detail"),
    path("calendar/", CalendarView.as_view(), name="calendar"),
    path(
        "bookings/<uuid:booking_id>/accept/",
        BookingDecisionView.as_view(action="accept"),
        name="booking-accept",
    ),
    path(
        "bookings/<uuid:booking_id>/decline/",
        BookingDecisionView.as_view(action="decline"),
        name="booking-decline",
    ),
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
