from django.db import models

from workspace.models.workspace import Workspace


class WorkspaceRole(models.Model):
    name = models.CharField(max_length=100)
    label = models.CharField(max_length=100)
    is_system = models.BooleanField(default=False)
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name="roles",
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.label
