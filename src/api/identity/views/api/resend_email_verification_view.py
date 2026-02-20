from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

# from identity.permissions import IsAuthenticatedPermission 
from core.message_bag import MessageBag
from identity.serializers import ResendEmailVerificationSerializer 
from rest_framework.permissions import AllowAny
from identity.services import UserService
from identity.utils import send_signup_email


class ResendEmailVerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = ResendEmailVerificationSerializer(data=request.data)

        if serializer.is_valid():
            user = UserService.get_user_by_email(request.data['email'])
            if not user:
                return Response(
                    {"error": MessageBag.DATA_NOT_FOUND.format(data=request.data['email'])},
                    status=status.HTTP_404_NOT_FOUND)
            
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
