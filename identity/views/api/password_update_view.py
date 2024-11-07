from rest_framework import status
from rest_framework.generics import UpdateAPIView
from rest_framework.response import Response

from identity.serializers import PasswordUpdateSerializer


class PasswordUpdateView(UpdateAPIView):
    serializer_class = PasswordUpdateSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Update the password
        serializer.save()
        return Response(serializer.data)
