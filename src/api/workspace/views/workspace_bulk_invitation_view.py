from rest_framework import status
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.message_bag import MessageBag
from workspace.exceptions import (
    AlreadyWorkspaceMemberError,
    InvalidBulkInviteFileError,
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
from workspace.services import WorkspaceInvitationService, WorkspaceService
from workspace.services.bulk_invite_file_parser_service import (
    BulkInviteFileParserService,
)


class WorkspaceBulkInvitationView(APIView):
    """
    POST /api/v1/workspace/<slug>/invitations/bulk/  -> invite many emails from a CSV/Excel file
    """

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

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

        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response(
                {"_message": MessageBag.FIELD_IS_REQUIRED.format(field="file")},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        try:
            rows = BulkInviteFileParserService.parse(uploaded_file)
        except InvalidBulkInviteFileError as e:
            return Response(
                {"_message": str(e)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        serializer = WorkspaceInvitationCreateSerializer(
            data={"invites": rows, "team_slug": request.data.get("team_slug", "")}
        )
        if not serializer.is_valid():
            return Response(
                serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        try:
            invitations = WorkspaceInvitationService.create_invitations_from_payload(
                workspace=workspace,
                validated_data=serializer.validated_data,
                invited_by=request.user,
            )
        except TeamNotFoundError:
            return Response(
                {"_message": MessageBag.DATA_NOT_FOUND.format(data="Team")},
                status=status.HTTP_404_NOT_FOUND,
            )
        except AlreadyWorkspaceMemberError as e:
            return Response(
                {"_message": MessageBag.ALREADY_A_WORKSPACE_MEMBER.format(data=str(e))},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "invitations": WorkspaceInvitationSerializer(invitations, many=True).data,
                "_message": MessageBag.SENT_SUCCESSFULLY.format(data="Invitations"),
            },
            status=status.HTTP_201_CREATED,
        )
