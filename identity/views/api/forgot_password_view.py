import os
from rest_framework import status
from rest_framework.response import Response
from rest_framework.templatetags.rest_framework import data
from rest_framework.views import APIView
from core import settings
from core.message_bag import MessageBag
from dashboard.tasks import email_sender
from identity.enums import VerificationTypes
from identity.services import UserService
from identity.permissions import GuestOnlyPermission
from identity.serializers.forgot_password_serializer import ForgotPasswordSerializer
from identity.services.verification_token_service import VerificationTokenService


class ForgotPasswordView(APIView):
    permission_classes = [GuestOnlyPermission]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid() and isinstance(serializer.validated_data, dict):
            user = UserService().get_user_by_email(serializer.validated_data["email"])

            if not user:
                return Response(
                    {"user_error": MessageBag.DATA_NOT_FOUND.format(data="User")},
                    status=status.HTTP_404_NOT_FOUND,
                )

            v_type = VerificationTypes.FORGOT_PASSWORD_VERIFICATION.value

            vt_service = VerificationTokenService(v_type)
            token = vt_service.generate_token(user)

            if not isinstance(token, str):
                return Response(
                    {
                        "user_error": MessageBag.UNABLE_TO_GENERATE_DATA.format(
                            data="token"
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            verification_link = vt_service.generate_reset_password_verification_link(
                token
            )
            context = {"verification_link": verification_link}

            template = os.path.join(
                settings.BASE_DIR,
                "identity/templates/identity/emails/password_reset.email.html",
            )
            email_sender.delay("Password Reset", [user.email], template, context)

            return Response(
                {"_message": MessageBag.SENT_SUCCESSFULLY.format(data="Reset link")},
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
