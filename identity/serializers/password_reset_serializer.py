from os import error
from rest_framework import serializers

from core.message_bag import MessageBag
from identity.models.verification_token import VerificationToken
from django.contrib.auth.password_validation import validate_password


class PasswordResetSerializer(serializers.ModelSerializer):
    token = serializers.CharField(
        required=True,
        error_messages={"required": MessageBag.FIELD_IS_REQUIRED.format(field="Token")},
    )

    password = serializers.CharField(
        write_only=True,
        required=True,
        error_messages={
            "required": MessageBag.FIELD_IS_REQUIRED.format(field="password")
        },
        validators=[validate_password],
    )
    password_confirmation = serializers.CharField(
        write_only=True,
        required=True,
        error_messages={
            "required": MessageBag.FIELD_IS_REQUIRED.format(
                field="password confirmation"
            )
        },
    )

    def validate(self, data):
        if data["password"] != data["password_confirmation"]:
            raise serializers.ValidationError(
                MessageBag.FIELDS_DO_NOT_MATCH.format(field="Passwords")
            )
        return data

    class Meta:
        model = VerificationToken
        fields = ["token", "password", "password_confirmation"]
