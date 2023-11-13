from . import views
from django.urls import path

urlpatterns = [
    path("", views.dashboard, name="dashboard"),
    path("edit-profile", views.editProfile, name="edit-profile"),
    path("password/update", views.changePassword, name="password.update"),
    path("manage/schedule", views.manageSchedule, name="manage.schedule"),
]
