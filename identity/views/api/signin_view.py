from identity.permissions import GuestOnlyPermission
from knox.views import LoginView as KnoxLoginView
from rest_framework.response import Response
from identity.serializers.signin_serializer import SignInSerializer
from rest_framework import status
from identity.serializers import UserSerializer
from identity.services import UserService


class SignInView(KnoxLoginView):
    permission_classes = [GuestOnlyPermission]

    def post(self, request, *args, **kwargs):
        serializer = SignInSerializer(data=request.data)
        if serializer.is_valid() and isinstance(serializer.validated_data, dict):
            user = serializer.validated_data.get("user")
            request.user = user

            is_remember_user = serializer.validated_data.get("remember_me", False)

            response = UserService.create_token(
                user=user, remember_user=is_remember_user
            )

            if isinstance(response, object):
                return Response(
                    response,
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"token_error": response},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
