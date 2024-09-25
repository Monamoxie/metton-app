from django.urls import path
from identity.views.api import (
    SignupView,
    EmailVerificationView,
    SignInView,
    ForgotPasswordView,
    PasswordResetVerificationView,
    PasswordResetView,
)


# API Routes ::: Migration to DRF in progress
urlpatterns = [
    path("signup", SignupView.as_view()),
    path("verification/email", EmailVerificationView.as_view()),
    path("signin", SignInView.as_view()),
    path("forgot-password", ForgotPasswordView.as_view()),
    path("password-reset/verify", PasswordResetVerificationView.as_view()),
    path("password-reset", PasswordResetView.as_view()),
]
