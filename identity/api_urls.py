from django.urls import path
from identity.views.api import (
    SignupView,
    EmailVerificationView,
    SignInView,
    ForgotPasswordView,
    PasswordResetVerificationView,
    PasswordResetView,
    ResendEmailVerificationView,
)
from identity.views.api.user_profile_view import UserProfileView


# API Routes ::: Migration to DRF in progress
urlpatterns = [
    # NO AUTHENTICATION REQUIRED
    path("signup", SignupView.as_view()),
    path("verification/email", EmailVerificationView.as_view()),
    path("signin", SignInView.as_view()),
    path("forgot-password", ForgotPasswordView.as_view()),
    path("verification/password-reset", PasswordResetVerificationView.as_view()),
    path("password-reset", PasswordResetView.as_view()),
    # AUTHENTICATION REQUIRED
    path(
        "verification/email/resend",
        ResendEmailVerificationView().as_view(),
        name="resend-email-verification",
    ),
    path(
        "user/profile",
        UserProfileView().as_view(),
        name="user",
    ),
]
