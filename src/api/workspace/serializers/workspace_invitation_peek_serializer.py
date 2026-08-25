from rest_framework import serializers

from workspace.models import WorkspaceInvitation


class WorkspaceInvitationPeekSerializer(serializers.ModelSerializer):
    workspace_name = serializers.CharField(source="workspace.name", read_only=True)
    workspace_slug = serializers.SlugField(source="workspace.slug", read_only=True)

    class Meta:
        model = WorkspaceInvitation
        fields = ["email", "role", "workspace_name", "workspace_slug", "expires_at"]
        read_only_fields = fields
