from rest_framework import serializers
from workspace.models import Workspace
from core.message_bag import MessageBag


class WorkspaceSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        required=True,
        min_length=2,
        max_length=255,
        error_messages={
            "required": MessageBag.FIELD_IS_REQUIRED.format(field="name")
        },
    )
    slug = serializers.CharField(read_only=True)
    timezone = serializers.CharField(required=False)
    description = serializers.CharField(required=False)
    banner = serializers.ImageField(required=False, allow_null=True, use_url=False)
    photo = serializers.ImageField(required=False, allow_null=True, use_url=False)
    meta = serializers.JSONField(required=False, allow_null=True)

    class Meta:
        model = Workspace
        fields = [
            "id",
            "name",
            "slug",
            "timezone",
            "description",
            "banner",
            "photo",
            "meta",
            "created_at",
        ]
        read_only_fields = ["id", "slug", "created_at"]