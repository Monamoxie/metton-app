from django.urls import path
from identity.views import (
    SignupView,
    SigninView,
    EmailVerificationView,
    ForgotPasswordView,
    PasswordResetView,
    ResendEmailVerificationView,
)


# API Routes ::: Migration to DRF in progress
urlpatterns = [
    path("signup", SignupView.as_view(), name="signup"),
]
