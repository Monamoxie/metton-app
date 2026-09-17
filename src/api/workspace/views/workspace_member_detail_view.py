from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.message_bag import MessageBag
from workspace.enums import WorkspaceRoleName
from workspace.exceptions import (
    MembershipNotFoundError,
    TeamNotFoundError,
    WorkspaceNotFoundError,
)
from workspace.policies.team_policy import CanManageTeam
from workspace.policies.workspace_policy import CanUpdateWorkspace
from workspace.serializers.workspace_member_update_serializer import (
    WorkspaceMemberUpdateSerializer,
)
from workspace.serializers.workspace_membership_serializer import (
    WorkspaceMembershipSerializer,
)
from workspace.services import (
    TeamMembershipService,
    TeamService,
    WorkspaceMembershipService,
    WorkspaceService,
)


class WorkspaceMemberDetailView(APIView):
    """
    PATCH /api/v1/workspace/<slug>/members/<public_id>/  -> change a member's role and/or team,
    in a single request.
    """

    permission_classes = [IsAuthenticated]

    def patch(self, request, slug, public_id):
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
            membership = WorkspaceMembershipService.get_by_user_public_id(
                workspace, public_id
            )
        except MembershipNotFoundError:
            return Response(
                {"_message": MessageBag.DATA_NOT_FOUND.format(data="Member")},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = WorkspaceMemberUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        new_role = serializer.validated_data.get("role")
        team_slug = serializer.validated_data.get("team_slug")

        if new_role:
            # Changing a role is an Owner/Admin-only action — Manager can do everything else
            # this endpoint supports (moving a member between teams) but not grant or revoke
            # access itself.
            if not CanUpdateWorkspace().has_object_permission(request, self, workspace):
                return Response(
                    {"_message": MessageBag.ACTION_NOT_ALLOWED},
                    status=status.HTTP_403_FORBIDDEN,
                )
            if membership.role.name == WorkspaceRoleName.OWNER.value:
                return Response(
                    {"_message": MessageBag.ACTION_NOT_ALLOWED},
                    status=status.HTTP_403_FORBIDDEN,
                )

        team = None
        if team_slug:
            try:
                team = TeamService.get_by_slug(workspace, team_slug)
            except TeamNotFoundError:
                return Response(
                    {"_message": MessageBag.DATA_NOT_FOUND.format(data="Team")},
                    status=status.HTTP_404_NOT_FOUND,
                )

        if new_role:
            membership = WorkspaceMembershipService.change_role(membership, new_role)

        if team:
            TeamMembershipService.move_member(workspace, membership.user, team)

        team_map = TeamMembershipService.get_team_map_for_workspace(workspace)

        return Response(
            {
                "_message": MessageBag.UPDATED_SUCCESSFULLY.format(data="Member"),
                "member": WorkspaceMembershipSerializer(
                    membership, context={"team_map": team_map}
                ).data,
            },
            status=status.HTTP_200_OK,
        )
