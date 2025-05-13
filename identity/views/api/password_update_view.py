from rest_framework import status
from rest_framework.generics import UpdateAPIView
from rest_framework.response import Response

from core.message_bag import MessageBag
from identity.serializers import PasswordUpdateSerializer


class PasswordUpdateView(UpdateAPIView):
    serializer_class = PasswordUpdateSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)

        if serializer.is_valid():
            serializer.save()
            # TODO ::: send an email notification letting them know of this action
            return Response(
                {"_message": MessageBag.UPDATED_SUCCESSFULLY.format(data="Password")}
            )

        return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
