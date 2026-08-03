from rest_framework import serializers
from identity.models.user import User


class TeamMemberUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["public_id", "email", "name"]
        read_only_fields = fields
