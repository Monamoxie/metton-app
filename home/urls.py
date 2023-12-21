from . import views
from django.urls import path

urlpatterns = [
    path("meet/<public_id>", views.meet, name="meet"),
    path("meet/<public_id>/book", views.book, name="meet"),
    path(
        "business-hours/<public_id>",
        views.getUserBusinessHours,
        name="meet-business-hours",
    ),
    path("events/<public_id>", views.getUserEvents, name="meet-business-hours"),
]
