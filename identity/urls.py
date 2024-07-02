from django.urls import path
from identity.views import SignupView, SigninView

urlpatterns = [
    path("signup", SignupView.as_view(), name="signup"),
    path("signin", SigninView.as_view(), name="signin"),
]
