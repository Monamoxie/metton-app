from django.db import models

from core import settings
from workspace.models.workspace import Workspace
from workspace.models.workspace_role import WorkspaceRole


class WorkspaceMembership(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="workspace_memberships",
    )
    workspace = models.ForeignKey(
        Workspace, on_delete=models.CASCADE, related_name="memberships"
    )
    role = models.ForeignKey(
        WorkspaceRole, on_delete=models.PROTECT, related_name="granted_memberships"
    )
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="sent_invitations",
    )
    meta = models.JSONField(default=dict, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "workspace_memberships"
        unique_together = ("user", "workspace")
