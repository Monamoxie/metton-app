from rest_framework import serializers
from core.message_bag import MessageBag


class ResendEmailVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField(
        required=True,
        error_messages={"required": MessageBag.FIELD_IS_REQUIRED.format(field="Email")},
    )
