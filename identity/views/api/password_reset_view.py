from rest_framework import status
from rest_framework.response import Response
from rest_framework.templatetags.rest_framework import data
from rest_framework.views import APIView

from core.message_bag import MessageBag
from identity.enums import VerificationTypes
from identity.models.verification_token import VerificationToken
from identity.permissions import GuestOnlyPermission
from identity.serializers import (
    PasswordResetSerializer,
)
from identity.services import UserService
from identity.services.verification_token_service import VerificationTokenService


class PasswordResetView(APIView):
    permission_classes = [GuestOnlyPermission]

    def patch(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid() and isinstance(serializer.validated_data, dict):

            vt_service = VerificationTokenService(
                type=VerificationTypes.FORGOT_PASSWORD_VERIFICATION.value
            )

            token_validation = vt_service.validate(serializer.validated_data["token"])
            if (
                isinstance(token_validation, VerificationToken)
                and token_validation.user
            ):
                vt_service.destroy(serializer.validated_data["token"])

                UserService.update_password(
                    user=token_validation.user,
                    password=serializer.validated_data["password"],
                )
                return Response(
                    {"reset": MessageBag.CREATED_SUCCESSFULLY.format(data="Password")},
                    status=status.HTTP_200_OK,
                )

            return Response(
                {"token_error": token_validation},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
