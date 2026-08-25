from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.message_bag import MessageBag
from workspace.exceptions import WorkspaceNotFoundError
from workspace.serializers.workspace_membership_serializer import (
    WorkspaceMembershipSerializer,
)
from workspace.services import WorkspaceMembershipService, WorkspaceService


class WorkspaceMemberListView(APIView):
    """
    GET /api/v1/workspace/<slug>/members/  -> list a workspace's active members
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        try:
            workspace = WorkspaceService.get_by_slug(slug, request.user)
        except WorkspaceNotFoundError:
            return Response(
                {"_message": MessageBag.DATA_NOT_FOUND.format(data="Workspace")},
                status=status.HTTP_404_NOT_FOUND,
            )

        memberships = WorkspaceMembershipService.get_members_for_workspace(workspace)
        serializer = WorkspaceMembershipSerializer(memberships, many=True)
        return Response({"members": serializer.data}, status=status.HTTP_200_OK)
