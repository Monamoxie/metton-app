from django.urls import path
from identity.views.api import SignupView, EmailVerificationView


# API Routes ::: Migration to DRF in progress
urlpatterns = [
    path("signup", SignupView.as_view()),
    path("verify/email", EmailVerificationView.as_view()),
]
