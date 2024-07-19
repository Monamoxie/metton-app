from django.urls import path
from identity.views import (
    SignupView,
    SigninView,
    EmailVerificationView,
    ForgotPasswordView,
    PasswordResetView,
)

urlpatterns = [
    path("signup", SignupView.as_view(), name="signup"),
    path("signin", SigninView.as_view(), name="signin"),
    path("forgot-password", ForgotPasswordView.as_view(), name="forgot-password"),
    path(
        "verify/email/<str:token>",
        EmailVerificationView.as_view(),
        name="email-verification",
    ),
    path(
        "verify/password-reset/<str:token>",
        PasswordResetView.as_view(),
        name="password-reset-verification",
    ),
]
