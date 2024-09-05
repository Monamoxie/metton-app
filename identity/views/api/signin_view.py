from identity.permissions import GuestOnlyPermission
from knox.views import LoginView as KnoxLoginView
from rest_framework.response import Response
from identity.serializers.signin_serializer import SignInSerializer
from rest_framework import status


class SignInView(KnoxLoginView):
    permission_classes = [GuestOnlyPermission]

    def post(self, request, *args, **kwargs):
        serializer = SignInSerializer(data=request.data)
        if serializer.is_valid() and isinstance(serializer.validated_data, dict):
            user = serializer.validated_data["user"]
            request.user = user

            return super(SignInView, self).post(request, format=None)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
