from django.db import models


class WorkspaceRole(models.Model):
    name = models.CharField(max_length=100)
    label = models.CharField(max_length=100)
    is_system = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.label
