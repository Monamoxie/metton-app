from rest_framework import serializers
from rest_framework.fields import EmailValidator

from core.message_bag import MessageBag
from core.utils import CoreUtils
from dashboard.models.user import User


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(
        required=True,
        error_messages={"required": MessageBag.FIELD_IS_REQUIRED.format(field="email")},
        validators=[
            EmailValidator(message=MessageBag.DATA_IS_INVALID.format(data="email"))
        ],
    )

    source = serializers.CharField(
        required=False,
        allow_blank=True
    )

    recaptcha = serializers.CharField(
        required=False,
        allow_blank=True
    )

    class Meta:
        model = User
        fields = ["email", "source", "recaptcha"]

    def validate(self, data): 

        # - Hidden input meant to trick bots. Equivalent to a honeypot
        # - If filled, assume request is from a bot and immediately deny request
        if "source" in data and data["source"]:
            raise serializers.ValidationError(
                {"source": MessageBag.INVALID_REQUEST}
            )
        
        if "recaptcha" in data and data["recaptcha"]:
            try:
                validation = CoreUtils.validate_recaptcha(data["recaptcha"])
                if validation == None:
                    raise serializers.ValidationError({"recaptcha": MessageBag.DATA_NOT_ACTIVATED.format(data="reCaptcha")})
            except Exception as e:
                raise serializers.ValidationError({"recaptcha": str(e)})

        return data
