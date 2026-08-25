from rest_framework import serializers

from workspace.models import WorkspaceInvitation


class WorkspaceInvitationSerializer(serializers.ModelSerializer):
    team = serializers.SlugField(source="team.slug", read_only=True, default=None)

    class Meta:
        model = WorkspaceInvitation
        fields = ["email", "role", "team", "status", "expires_at", "created_at"]
        read_only_fields = fields
