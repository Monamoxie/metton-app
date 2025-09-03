from django.urls import path

from home.views.booking_view import BookingView

# @depreciated: migrating urls to DRF api
urlpatterns = [
    path("<str:public_id>/book", BookingView().as_view(), name="book"),
]