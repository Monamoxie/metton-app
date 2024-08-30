from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.message_bag import MessageBag
from dashboard.models.user import User
from identity.serializers import SignupSerializer, UserSerializer
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from knox.views import LoginView as KnoxLoginView
from knox.models import AuthToken
from rest_framework import generics
from knox.settings import CONSTANTS, knox_settings
from django.utils import timezone
from rest_framework.authtoken.models import Token
from identity.utils import send_signup_email

User = get_user_model()


class SignupView(APIView):
    permission_classes = [AllowAny]

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
