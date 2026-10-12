from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.message_bag import MessageBag
from event.serializers.public_profile_serializer import PublicProfileSerializer
from identity.models.user import User


class PublicProfileView(APIView):
    """
    GET /api/v1/event/<public_id>/public-profile/
    -> public, unauthenticated — the host's public booking-page profile.
    """

    permission_classes = [AllowAny]

    def get(self, request, public_id):
        user = User.objects.filter(public_id=public_id).first()
        if not user:
            return Response(
                {"_message": MessageBag.DATA_NOT_FOUND.format(data="User")},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {"profile": PublicProfileSerializer(user).data},
            status=status.HTTP_200_OK,
        )
