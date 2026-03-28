from rest_framework import serializers
from workspace.models import Workspace
from core.message_bag import MessageBag


class WorkspaceSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        required=True,
        error_messages={
            "required": MessageBag.FIELD_IS_REQUIRED.format(field="name")
        },
    )
    description = serializers.CharField(required=False)
    banner = serializers.ImageField(required=False, allow_null=True, use_url=False)
    photo = serializers.ImageField(required=False, allow_null=True, use_url=False)
    meta = serializers.JSONField(required=False, allow_null=True)

    class Meta:
        model = Workspace