from core.message_bag import MessageBag
from rest_framework import serializers
from workspace.enums import WorkspaceRoleName


class WorkspaceMemberUpdateSerializer(serializers.Serializer):
    role = serializers.CharField(required=False, allow_blank=False)
    team_slug = serializers.CharField(required=False, allow_blank=False)

    def validate_role(self, value: str) -> str:
        normalized = value.strip().title()
        if normalized not in WorkspaceRoleName.assignable():
            raise serializers.ValidationError(
                MessageBag.DATA_IS_INVALID.format(data="role")
            )
        return normalized

    def validate(self, attrs: dict) -> dict:
        if not attrs:
            raise serializers.ValidationError(
                MessageBag.FIELD_IS_REQUIRED.format(field="role or team_slug")
            )
        return attrs
