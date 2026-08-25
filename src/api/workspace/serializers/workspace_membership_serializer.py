from rest_framework import serializers

from workspace.models import WorkspaceMembership
from workspace.serializers.team_member_user_serializer import TeamMemberUserSerializer


class WorkspaceMembershipSerializer(serializers.ModelSerializer):
    user = TeamMemberUserSerializer(read_only=True)
    role = serializers.CharField(source="role.name", read_only=True)

    class Meta:
        model = WorkspaceMembership
        fields = ["user", "role", "created_at"]
        read_only_fields = fields
