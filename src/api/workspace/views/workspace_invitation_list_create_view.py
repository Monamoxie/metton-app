from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.message_bag import MessageBag
from workspace.exceptions import (
    AlreadyWorkspaceMemberError,
    TeamNotFoundError,
    WorkspaceNotFoundError,
)
from workspace.policies.team_policy import CanManageTeam
from workspace.serializers.workspace_invitation_create_serializer import (
    WorkspaceInvitationCreateSerializer,
)
from workspace.serializers.workspace_invitation_serializer import (
    WorkspaceInvitationSerializer,
)
from workspace.services import TeamService, WorkspaceInvitationService, WorkspaceService
from workspace.utils import send_workspace_invite_email


class WorkspaceInvitationListCreateView(APIView):
    """
    GET  /api/v1/workspace/<slug>/invitations/  -> list pending invitations
    POST /api/v1/workspace/<slug>/invitations/  -> invite one or more emails
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

        invitations = WorkspaceInvitationService.list_pending_for_workspace(workspace)
        serializer = WorkspaceInvitationSerializer(invitations, many=True)
        return Response({"invitations": serializer.data}, status=status.HTTP_200_OK)

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

        serializer = WorkspaceInvitationCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        team = None
        team_slug = serializer.validated_data.get("team_slug")
        if team_slug:
            try:
                team = TeamService.get_by_slug(workspace, team_slug)
            except TeamNotFoundError:
                return Response(
                    {"_message": MessageBag.DATA_NOT_FOUND.format(data="Team")},
                    status=status.HTTP_404_NOT_FOUND,
                )

        try:
            invitations = WorkspaceInvitationService.create_invitations(
                workspace=workspace,
                invites=serializer.validated_data["invites"],
                invited_by=request.user,
                team=team,
            )
        except AlreadyWorkspaceMemberError as e:
            return Response(
                {"_message": MessageBag.ALREADY_A_WORKSPACE_MEMBER.format(data=str(e))},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for invitation in invitations:
            send_workspace_invite_email(invitation, invitation.plain_token)

        return Response(
            {
                "invitations": WorkspaceInvitationSerializer(invitations, many=True).data,
                "_message": MessageBag.SENT_SUCCESSFULLY.format(data="Invitations"),
            },
            status=status.HTTP_201_CREATED,
        )
