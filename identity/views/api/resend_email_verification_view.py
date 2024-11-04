from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

# from identity.permissions import IsAuthenticatedPermission
from rest_framework.permissions import IsAuthenticated
from core.message_bag import MessageBag
from identity.serializers import ResendEmailVerificationSerializer
from knox.auth import TokenAuthentication

from identity.utils import send_signup_email


class ResendEmailVerificationView(APIView):

    def post(self, request, *args, **kwargs):
        serializer = ResendEmailVerificationSerializer(data=request.data)

        if serializer.is_valid():
            user = request.user
            if user.email_verified:
                return Response(
                    {"error": MessageBag.DATA_ALREADY_VERIFIED.format(data="Email")},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            else:
                send_signup_email(user=user)
                return Response(
                    {
                        "_message": MessageBag.SENT_SUCCESSFULLY.format(
                            data="Your email verification link"
                        ),
                    },
                    status=status.HTTP_200_OK,
                )

        return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
