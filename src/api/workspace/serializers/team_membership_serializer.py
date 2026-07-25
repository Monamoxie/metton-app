from rest_framework import serializers
from workspace.models import TeamMembership
from workspace.serializers.team_member_user_serializer import TeamMemberUserSerializer


class TeamMembershipSerializer(serializers.ModelSerializer):
    user = TeamMemberUserSerializer(read_only=True)

    class Meta:
        model = TeamMembership
        fields = ["user", "role", "created_at"]
        read_only_fields = fields
