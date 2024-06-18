from django.urls import path
from . import views_legacy
from authentication.views import SignupView

urlpatterns = [
    path("signup", SignupView.as_view(), name="signup"),
    path("login", views_legacy.login, name="login"),
]
