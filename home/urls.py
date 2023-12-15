from . import views
from django.urls import path

urlpatterns = [
    path("meet/<public_id>", views.meet, name="meet"),
]
