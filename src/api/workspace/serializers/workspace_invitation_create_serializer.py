from rest_framework import serializers

from core.message_bag import MessageBag
from workspace.serializers.workspace_invite_entry_serializer import (
    WorkspaceInviteEntrySerializer,
)


class WorkspaceInvitationCreateSerializer(serializers.Serializer):
    invites = WorkspaceInviteEntrySerializer(
        many=True,
        required=True,
        allow_empty=False,
        error_messages={"required": MessageBag.FIELD_IS_REQUIRED.format(field="invites")},
    )
    team_slug = serializers.CharField(required=False, allow_blank=True)
