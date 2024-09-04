from os import error
from rest_framework import serializers

from core.message_bag import MessageBag
from identity.models.verification_token import VerificationToken


class EmailVerificationSerializer(serializers.ModelSerializer):
    token = serializers.CharField(
        required=True,
        error_messages={
            "required": MessageBag().FIELD_IS_REQUIRED.format(field="Token")
        },
    )

    class Meta:
        model = VerificationToken
        fields = ["token"]
