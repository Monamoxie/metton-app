from . import views
from django.urls import path
from .views import ProfileUpdateView, PasswordUpdateView

urlpatterns = [
    path("", views.dashboard, name="dashboard"),
    path("profile-update", ProfileUpdateView.as_view(), name="profile_update"),
    path("password-update", PasswordUpdateView.as_view(), name="password_update"),
    path("manage/schedule", views.manageSchedule, name="manage.schedule"),
    path("events", views.getEvents, name="events"),
    path("events/detach", views.detachEvent, name="delete-event"),
    path("business-hours", views.getBusinessHours, name="business-hours"),
    path("business-hours/detach", views.detachBusinessHours, name="business-hours"),
    path("logout", views.logout, name="logout"),
]
