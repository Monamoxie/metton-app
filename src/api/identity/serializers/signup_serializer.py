from rest_framework import serializers
from core import settings
from core.utils import CoreUtils
from dashboard.models.user import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.core.validators import EmailValidator
from rest_framework.validators import UniqueValidator
from core.message_bag import MessageBag


class SignupSerializer(serializers.ModelSerializer):

    email = serializers.EmailField(
        required=True,
        error_messages={"required": MessageBag.FIELD_IS_REQUIRED.format(field="email")},
        validators=[
            EmailValidator(message=MessageBag.DATA_IS_INVALID.format(data="email")),
            UniqueValidator(
                queryset=User.objects.all(),
                message=MessageBag.FIELD_IS_DUPLICATE.format(field="email"),
            ),
        ],
    )
    password1 = serializers.CharField(
        write_only=True,
        required=True,
        error_messages={
            "required": MessageBag.FIELD_IS_REQUIRED.format(field="password")
        },
        validators=[validate_password],
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        error_messages={
            "required": MessageBag.FIELD_IS_REQUIRED.format(
                field="password confirmation"
            )
        },
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
        fields = ["email", "password1", "password2", "source", "recaptcha"]

    def validate(self, data):
        if data["password1"] != data["password2"]:
            raise serializers.ValidationError(
                MessageBag.FIELDS_DO_NOT_MATCH.format(field="Passwords")
            )
 
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

    def create(self, validated_data) -> User:
        user = User.objects.create(email=validated_data["email"])
        user.set_password(validated_data["password1"])
        user.save()
        return user
