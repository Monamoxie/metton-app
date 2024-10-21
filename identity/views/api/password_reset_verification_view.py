from rest_framework import status
from rest_framework.response import Response
from rest_framework.templatetags.rest_framework import data
from rest_framework.views import APIView

from core.message_bag import MessageBag
from identity.enums import VerificationTypes
from identity.models.verification_token import VerificationToken
from identity.permissions import GuestOnlyPermission
from identity.serializers.password_reset_verification_serializer import (
    PasswordResetVerificationSerializer,
)
from identity.services.verification_token_service import VerificationTokenService


class PasswordResetVerificationView(APIView):
    permission_classes = [GuestOnlyPermission]

    def post(self, request):
        serializer = PasswordResetVerificationSerializer(data=request.data)
        return Response(
            {"token": MessageBag.DATA_IS_VALID.format(data="Token")},
            status=status.HTTP_200_OK,
        )
        if serializer.is_valid() and isinstance(serializer.validated_data, dict):
            token = serializer.validated_data["token"]

            v_type = VerificationTypes.FORGOT_PASSWORD_VERIFICATION.value
            vt_service = VerificationTokenService(type=v_type)

            token_validation = vt_service.validate(token)
            if (
                isinstance(token_validation, VerificationToken)
                and token_validation.user
            ):
                return Response(
                    {"token": MessageBag.DATA_IS_VALID.format(data="Token")},
                    status=status.HTTP_200_OK,
                )

            return Response(
                {"token_error": token_validation},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
