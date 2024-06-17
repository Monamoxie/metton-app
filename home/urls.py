from . import views_legacy
from django.urls import path
from home.views import BookingView, BookingCalendarView

urlpatterns = [
    path("", views_legacy.index, name="index"),
    path("meet/<str:public_id>", BookingCalendarView.as_view(), name="meet"),
    path("meet/<str:public_id>/book", BookingView.as_view(), name="book"),
    path(
        "business-hours/<public_id>",
        views_legacy.getUserBusinessHours,
        name="meet-business-hours",
    ),
    path("events/<public_id>", views_legacy.getUserEvents, name="meet-user-events"),
]
