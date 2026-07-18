from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.message_bag import MessageBag
from workspace.exceptions import WorkspaceLimitReachedError
from workspace.serializers.workspace_serializer import WorkspaceSerializer
from workspace.services import WorkspaceService


class WorkspaceView(APIView):
    """
    GET  /api/v1/workspace/  -> list workspaces the requesting user belongs to
    POST /api/v1/workspace/  -> create a workspace, with the requester as owner
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        workspaces = WorkspaceService.get_workspaces_for_user(request.user)
        serializer = WorkspaceSerializer(workspaces, many=True)
        return Response(
            {"workspaces": serializer.data},
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = WorkspaceSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        try:
            workspace = WorkspaceService.create_workspace(
                user=request.user,
                name=serializer.validated_data["name"],
                timezone=serializer.validated_data.get("timezone", "UTC"),
            )
        except WorkspaceLimitReachedError:
            return Response(
                {"_message": MessageBag.WORKSPACE_LIMIT_REACHED},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "workspace": WorkspaceSerializer(workspace).data,
                "_message": MessageBag.CREATED_SUCCESSFULLY.format(data="Workspace"),
            },
            status=status.HTTP_201_CREATED,
        )
