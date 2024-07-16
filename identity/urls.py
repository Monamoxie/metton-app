from django.urls import path
from identity.views import SignupView, SigninView
from identity.views.email_verification_view import EmailVerificationView

urlpatterns = [
    path("signup", SignupView.as_view(), name="signup"),
    path("signin", SigninView.as_view(), name="signin"),
    path(
        "verify/email/<str:token>",
        EmailVerificationView.as_view(),
        name="email-verification",
    ),
]
