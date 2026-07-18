from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.message_bag import MessageBag
from workspace.exceptions import WorkspaceNotFoundError
from workspace.serializers.workspace_serializer import WorkspaceSerializer
from workspace.services import WorkspaceService


class WorkspaceDetailView(APIView):
    """
    GET /api/v1/workspace/<slug>/  -> retrieve a single workspace the requester belongs to
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

        return Response(
            {"workspace": WorkspaceSerializer(workspace).data},
            status=status.HTTP_200_OK,
        )
