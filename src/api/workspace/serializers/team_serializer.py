from rest_framework import serializers
from workspace.models import Team
from core.message_bag import MessageBag


class TeamSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        required=True,
        min_length=2,
        max_length=255,
        error_messages={
            "required": MessageBag.FIELD_IS_REQUIRED.format(field="name")
        },
    )
    slug = serializers.CharField(read_only=True)

    class Meta:
        model = Team
        fields = ["id", "name", "slug", "is_default", "created_at"]
        read_only_fields = ["id", "slug", "is_default", "created_at"]
