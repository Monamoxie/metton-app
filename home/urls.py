from . import views_legacy
from django.urls import path
from home.views import BookingView, BookingCalendarView, UserBusinessHoursView
from django.views.generic import TemplateView

urlpatterns = [
    path("", TemplateView.as_view(template_name="home/index.html"), name="index"),
    path("meet/<str:public_id>", BookingCalendarView.as_view(), name="meet"),
    path("meet/<str:public_id>/book", BookingView.as_view(), name="book"),
    path(
        "business-hours/<public_id>",
        UserBusinessHoursView.as_view(),
        name="meet-business-hours",
    ),
    path("events/<public_id>", views_legacy.getUserEvents, name="meet-user-events"),
]
