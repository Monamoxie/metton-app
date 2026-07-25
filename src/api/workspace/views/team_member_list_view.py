from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.message_bag import MessageBag
from workspace.exceptions import TeamNotFoundError, WorkspaceNotFoundError
from workspace.serializers.team_membership_serializer import TeamMembershipSerializer
from workspace.services import TeamMembershipService, TeamService, WorkspaceService


class TeamMemberListView(APIView):
    """
    GET /api/v1/workspace/<slug>/teams/<team_slug>/members/  -> list a team's members
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, slug, team_slug):
        try:
            workspace = WorkspaceService.get_by_slug(slug, request.user)
        except WorkspaceNotFoundError:
            return Response(
                {"_message": MessageBag.DATA_NOT_FOUND.format(data="Workspace")},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            team = TeamService.get_by_slug(workspace, team_slug)
        except TeamNotFoundError:
            return Response(
                {"_message": MessageBag.DATA_NOT_FOUND.format(data="Team")},
                status=status.HTTP_404_NOT_FOUND,
            )

        memberships = TeamMembershipService.get_members_for_team(team)
        serializer = TeamMembershipSerializer(memberships, many=True)
        return Response({"members": serializer.data}, status=status.HTTP_200_OK)
