from rest_framework import serializers
from rest_framework.fields import EmailValidator

from core.message_bag import MessageBag


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(
        required=True,
        error_messages={"required": MessageBag.FIELD_IS_REQUIRED.format(field="email")},
        validators=[
            EmailValidator(message=MessageBag.DATA_IS_INVALID.format(data="email"))
        ],
    )
