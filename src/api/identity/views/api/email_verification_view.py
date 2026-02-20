from typing import Union
from urllib import response
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

            verification_message = service.verify_email_token(request.data.get("token"))

            response = {}
            status_code = (
                status.HTTP_200_OK
                if verification_message == VerificationTokenService.SUCCESS_STATUS
                else status.HTTP_400_BAD_REQUEST
            )

            if verification_message == VerificationTokenService.SUCCESS_STATUS:
                response["_message"] = verification_message
            else:
                response["token_error"] = verification_message

            return Response(response, status=status_code)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
