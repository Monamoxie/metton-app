from . import views
from django.urls import path

urlpatterns = [
    path("", views.index, name="index"),
    path("meet/<public_id>", views.meet, name="meet"),
    path("meet/<public_id>/book", views.book, name="book"),
    path(
        "business-hours/<public_id>",
        views.getUserBusinessHours,
        name="meet-business-hours",
    ),
    path("events/<public_id>", views.getUserEvents, name="meet-user-events"),
]
