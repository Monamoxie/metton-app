from rest_framework import serializers

from workspace.models import WorkspaceMembership
from workspace.serializers.team_member_user_serializer import TeamMemberUserSerializer


class WorkspaceMembershipSerializer(serializers.ModelSerializer):
    user = TeamMemberUserSerializer(read_only=True)
    role = serializers.CharField(source="role.name", read_only=True)
    team = serializers.SerializerMethodField()

    class Meta:
        model = WorkspaceMembership
        fields = ["user", "role", "team", "created_at"]
        read_only_fields = fields

    def get_team(self, obj: WorkspaceMembership) -> dict | None:
        team = self.context.get("team_map", {}).get(obj.user_id)
        if team is None:
            return None
        return {"id": team.id, "name": team.name, "slug": team.slug}
