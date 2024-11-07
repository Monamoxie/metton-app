from functools import partial
from rest_framework import status
from rest_framework.generics import RetrieveUpdateAPIView, UpdateAPIView
from rest_framework.response import Response

from identity.serializers import UserSerializer


class UserProfileView(RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_update(serializer)
        return Response(serializer.data)
