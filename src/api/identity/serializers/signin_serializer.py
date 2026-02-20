from rest_framework import serializers
from core.utils import CoreUtils
from dashboard.models.user import User
from django.contrib.auth.password_validation import validate_password
from django.utils.translation import gettext_lazy as _
from django.core.validators import EmailValidator
from core.message_bag import MessageBag
from django.contrib.auth import authenticate


class SignInSerializer(serializers.ModelSerializer):

    email = serializers.EmailField(
        required=True,
        error_messages={"required": MessageBag.FIELD_IS_REQUIRED.format(field="email")},
        validators=[
            EmailValidator(message=MessageBag.DATA_IS_INVALID.format(data="email"))
        ],
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        error_messages={
            "required": MessageBag.FIELD_IS_REQUIRED.format(field="password")
        },
    )

    remember_me = serializers.BooleanField(default=False, required=False)

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
        fields = ["email", "password", "remember_me", "source", "recaptcha"]

    def validate(self, data):
        user = authenticate(email=data["email"], password=data["password"])

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
        
        if not user:
            raise serializers.ValidationError(
                {"authentication": MessageBag.INVALID_SIGNIN_CREDENTIALS}
            )
        data["user"] = user

        return data
