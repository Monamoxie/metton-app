from rest_framework import serializers

from core.message_bag import MessageBag
from workspace.enums import WorkspaceRoleName

INVITABLE_ROLES = {WorkspaceRoleName.ADMIN.value, WorkspaceRoleName.MEMBER.value}


class WorkspaceInviteEntrySerializer(serializers.Serializer):
    email = serializers.EmailField(
        required=True,
        error_messages={"required": MessageBag.FIELD_IS_REQUIRED.format(field="email")},
    )
    role = serializers.CharField(
        required=True,
        error_messages={"required": MessageBag.FIELD_IS_REQUIRED.format(field="role")},
    )

    def validate_role(self, value: str) -> str:
        normalized = value.strip().title()
        if normalized not in INVITABLE_ROLES:
            raise serializers.ValidationError(
                MessageBag.DATA_IS_INVALID.format(data="role")
            )
        return normalized
