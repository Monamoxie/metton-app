from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.message_bag import MessageBag
from workspace.exceptions import InvitationExpiredError, InvitationNotFoundError
from workspace.serializers.workspace_invitation_peek_serializer import (
    WorkspaceInvitationPeekSerializer,
)
from workspace.services import WorkspaceInvitationService


class WorkspaceInvitationPeekView(APIView):
    """
    GET /api/v1/workspace/invitations/<token>/  -> preview an invitation, no auth required
    """

    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            invitation = WorkspaceInvitationService.peek(token)
        except InvitationNotFoundError:
            return Response(
                {"_message": MessageBag.DATA_NOT_FOUND.format(data="Invitation")},
                status=status.HTTP_404_NOT_FOUND,
            )
        except InvitationExpiredError:
            return Response(
                {"_message": MessageBag.DATA_IS_EXPIRED.format(data="invitation")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"invitation": WorkspaceInvitationPeekSerializer(invitation).data},
            status=status.HTTP_200_OK,
        )
