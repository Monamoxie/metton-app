from django.urls import path
from identity.views.api import (
    SignupView,
    EmailVerificationView,
    SignInView,
    ForgotPasswordView,
    PasswordResetVerificationView,
    PasswordResetView,
    ResendEmailVerificationView,
    PasswordUpdateView,
)
from identity.views.api.user import UserProfileView


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
    # GET, PATCH
    path(
        "user/profile",
        UserProfileView().as_view(),
        name="user-profile",
    ),
    path(
        "password-update",
        PasswordUpdateView().as_view(),
        name="user-password-update",
    ),
]
