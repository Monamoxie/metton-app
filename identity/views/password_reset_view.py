import os
from typing import Any, Union
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.urls import reverse_lazy
from django.views.generic import FormView
from core import settings
from core.mixins.guest_only_mixin import GuestOnlyMixin
from core.services.user_service import UserService
from dashboard.models.user import User
from dashboard.tasks import email_sender
from identity.enums import VerificationTypes
from identity.models.verification_token import VerificationToken
from identity.services.verification_token_service import VerificationTokenService
from django.contrib.auth.forms import SetPasswordForm
from django.contrib import messages
from django.shortcuts import redirect


class PasswordResetView(GuestOnlyMixin, FormView):
    """Set a new password via reset"""

    service: VerificationTokenService
    token: str
    user: User

    template_name = "identity/password_reset.html"
    form_class = SetPasswordForm
    success_url = reverse_lazy("signin")
    status = False

    def get_user(self) -> Union[User, None]:
        """Get user based on provided token"""

        valid_token = self.service.validate(self.token)
        if (
            valid_token
            and isinstance(valid_token, VerificationToken)
            and valid_token.user
        ):
            self.status = True
            return valid_token.user

        return None

    def dispatch(self, request, *args, **kwargs):
        """Handle the user check and redirection before processing the form"""
        type = VerificationTypes.FORGOT_PASSWORD_VERIFICATION.value
        self.service = VerificationTokenService(type=type)

        self.token = self.kwargs.get("token")
        user = self.get_user()

        if not user:
            messages.error(request, VerificationTokenService.INVALID_RESET_LINK)
            return redirect("forgot-password")

        self.user = user

        return super().dispatch(request, *args, **kwargs)

    def get_form_kwargs(self) -> dict[str, Any]:
        """Pass the user object to the form before the form's instantiation"""
        kwargs = super().get_form_kwargs()
        kwargs["user"] = self.user

        return kwargs

    def get_context_data(self, **kwargs) -> dict[str, Any]:
        """Pass the status to the template"""
        context = super().get_context_data(**kwargs)

        context["status"] = self.status
        context["token"] = self.token

        return context

    def form_invalid(self, form) -> HttpResponse:
        messages.error(self.request, f"{form.errors}")
        return super().form_invalid(form)

    def form_valid(self, form):
        form.save()
        self.service.destroy(self.token)

        # todo ::: Trigger email to user to notifiy them of the password change
        template = os.path.join(
            settings.BASE_DIR,
            "identity/templates/identity/emails/password_updated.email.html",
        )
        email_sender.delay("Password Updated!", [self.user.email], template, {})

        messages.success(self.request, "Password reset successful. You can now login")
        return redirect(self.success_url)

    def render_to_response(self, context, **response_kwargs):
        """For enhanced security, add cache control headers to prevent back button issue"""
        response = super().render_to_response(context, **response_kwargs)
        response["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response["Pragma"] = "no-cache"
        response["Expires"] = "Thu, 01 Jan 1970 00:00:00 GMT"
        return response
