from django.urls import path

from event.views import BookingView

urlpatterns = [
    path("<str:public_id>/book", BookingView.as_view(), name="book"),
]
