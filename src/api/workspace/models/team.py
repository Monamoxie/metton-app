from django.db import models
from workspace.models.workspace import Workspace


class Team(models.Model):
    workspace = models.ForeignKey(
        Workspace, on_delete=models.CASCADE, related_name="teams"
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=100)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "workspace_teams"
        unique_together = ("workspace", "slug")

    def __str__(self) -> str:
        return self.name
