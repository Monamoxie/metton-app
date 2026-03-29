from django.db import models
from core import settings


class Workspace(models.Model):
    name = models.CharField(max_length=255)
    slug = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
    )
    photo = models.ImageField(upload_to="workspace/profile", null=True)
    banner = models.ImageField(upload_to="workspace/banner", null=True)
    meta = models.JSONField(default=dict, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "workspace_workspaces"

    def __str__(self) -> str:
        return self.name
