from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.message_bag import MessageBag
from dashboard.models.user import User
from identity.permissions import GuestOnlyPermission
from identity.serializers import SignupSerializer, UserSerializer
from identity.utils import send_signup_email

class SignupView(APIView):
    permission_classes = [GuestOnlyPermission]

    def post(self, request, *args, **kwargs):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            user_data = UserSerializer(user).data

            if isinstance(user, User):
                send_signup_email(user=user)
                return Response(
                    {
                        "user": user_data,
                        "_message": MessageBag.CREATED_SUCCESSFULLY.format(data="User"),
                    },
                    status=status.HTTP_201_CREATED,
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
