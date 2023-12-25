from . import views
from django.urls import path

urlpatterns = [
    path("", views.dashboard, name="dashboard"),
    path("edit-profile", views.editProfile, name="edit-profile"),
    path("password/update", views.changePassword, name="password.update"),
    path("manage/schedule", views.manageSchedule, name="manage.schedule"),
    path("events", views.getEvents, name="events"),
    path("events/detach", views.detachEvent, name="delete-event"),
    path("business-hours", views.getBusinessHours, name="business-hours"),
    path("business-hours/detach", views.detachBusinessHours, name="business-hours"),
]
