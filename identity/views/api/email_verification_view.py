from typing import Union
from rest_framework.generics import UpdateAPIView
from rest_framework.response import Response
from rest_framework import status
from core.message_bag import MessageBag
from identity.enums import VerificationTypes
from identity.serializers.email_verification_serializer import (
    EmailVerificationSerializer,
)
from identity.services.verification_token_service import VerificationTokenService
from rest_framework.serializers import ListSerializer


class EmailVerificationView(UpdateAPIView):
    lookup_field = "token"
    permission_classes = []

    def patch(self, request, *args, **kwargs):
        serializer = EmailVerificationSerializer(data=request.data)

        if serializer.is_valid():
            verification_type = VerificationTypes.EMAIL_VERIFICATION.value
            service = VerificationTokenService(verification_type)

            response = service.verify_email_token(request.data.get("token"))
            return Response(
                {
                    "token": response,
                },
                status=(
                    status.HTTP_200_OK
                    if response == VerificationTokenService.SUCCESS_STATUS
                    else status.HTTP_400_BAD_REQUEST
                ),
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
