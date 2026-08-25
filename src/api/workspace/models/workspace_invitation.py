from django.db import models

from core import settings
from workspace.enums import WorkspaceInvitationStatus, WorkspaceRoleName
from workspace.models.team import Team
from workspace.models.workspace import Workspace


class WorkspaceInvitation(models.Model):
    workspace = models.ForeignKey(
        Workspace, on_delete=models.CASCADE, related_name="invitations"
    )
    team = models.ForeignKey(
        Team, on_delete=models.SET_NULL, null=True, blank=True, related_name="invitations"
    )
    email = models.EmailField()
    role = models.CharField(
        max_length=100,
        choices=[
            (WorkspaceRoleName.ADMIN.value, WorkspaceRoleName.ADMIN.value),
            (WorkspaceRoleName.MEMBER.value, WorkspaceRoleName.MEMBER.value),
        ],
    )
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="sent_workspace_invitations",
    )
    token = models.CharField(max_length=256, unique=True)
    status = models.CharField(
        max_length=32,
        choices=WorkspaceInvitationStatus.options(),
        default=WorkspaceInvitationStatus.PENDING.value,
    )
    expires_at = models.DateTimeField()
    accepted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "workspace_invitations"

    def __str__(self) -> str:
        return f"{self.email} -> {self.workspace.slug} ({self.status})"
