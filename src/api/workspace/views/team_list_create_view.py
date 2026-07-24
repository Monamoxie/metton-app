from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.message_bag import MessageBag
from workspace.exceptions import TeamLimitReachedError, WorkspaceNotFoundError
from workspace.policies.team_policy import CanManageTeam
from workspace.serializers.team_serializer import TeamSerializer
from workspace.services import TeamService, WorkspaceService


class TeamListCreateView(APIView):
    """
    GET  /api/v1/workspace/<slug>/teams/  -> list teams in the workspace
    POST /api/v1/workspace/<slug>/teams/  -> create a team, with the requester as lead
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

        teams = TeamService.get_teams_for_workspace(workspace)
        serializer = TeamSerializer(teams, many=True)
        return Response({"teams": serializer.data}, status=status.HTTP_200_OK)

    def post(self, request, slug):
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

        serializer = TeamSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        try:
            team = TeamService.create_team(
                workspace=workspace,
                name=serializer.validated_data["name"],
                created_by=request.user,
            )
        except TeamLimitReachedError:
            return Response(
                {"_message": MessageBag.TEAM_LIMIT_REACHED},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "team": TeamSerializer(team).data,
                "_message": MessageBag.CREATED_SUCCESSFULLY.format(data="Team"),
            },
            status=status.HTTP_201_CREATED,
        )
