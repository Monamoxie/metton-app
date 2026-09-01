from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.message_bag import MessageBag
from workspace.exceptions import InvitationNotFoundError, WorkspaceNotFoundError
from workspace.policies.team_policy import CanManageTeam
from workspace.services import WorkspaceInvitationService, WorkspaceService


class WorkspaceInvitationDetailView(APIView):
    """
    DELETE /api/v1/workspace/<slug>/invitations/<invitation_id>/  -> revoke a pending invitation
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request, slug, invitation_id):
        try:
            workspace = WorkspaceService.get_by_slug(slug, request.user)
        except WorkspaceNotFoundError:
            return Response(
                {"_message": MessageBag.DATA_NOT_FOUND.format(data="Workspace")},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not CanManageTeam().has_object_permission(request, self, workspace):
            return Response(
                {"_message": MessageBag.ACTION_NOT_ALLOWED},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            WorkspaceInvitationService.revoke(workspace, invitation_id)
        except InvitationNotFoundError:
            return Response(
                {"_message": MessageBag.DATA_NOT_FOUND.format(data="Invitation")},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {"_message": MessageBag.DELETED_SUCCESSFULLY.format(data="Invitation")},
            status=status.HTTP_200_OK,
        )
