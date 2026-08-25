from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.message_bag import MessageBag
from workspace.exceptions import (
    InvitationAlreadyAcceptedError,
    InvitationEmailMismatchError,
    InvitationExpiredError,
    InvitationNotFoundError,
)
from workspace.serializers.workspace_serializer import WorkspaceSerializer
from workspace.services import WorkspaceInvitationService


class WorkspaceInvitationAcceptView(APIView):
    """
    POST /api/v1/workspace/invitations/<token>/accept/  -> join the workspace/team
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, token):
        try:
            invitation = WorkspaceInvitationService.accept(token, request.user)
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
        except InvitationAlreadyAcceptedError:
            return Response(
                {"_message": MessageBag.INVITATION_ALREADY_ACCEPTED},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except InvitationEmailMismatchError:
            return Response(
                {"_message": MessageBag.INVITATION_EMAIL_MISMATCH},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(
            {
                "workspace": WorkspaceSerializer(invitation.workspace).data,
                "_message": MessageBag.GENERIC_SUCCESS_MESSAGE,
            },
            status=status.HTTP_200_OK,
        )
