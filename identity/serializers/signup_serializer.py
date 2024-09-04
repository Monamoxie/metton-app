from rest_framework import serializers
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

    class Meta:
        model = User
        fields = ["email", "password1", "password2"]

    def validate(self, data):
        if data["password1"] != data["password2"]:
            raise serializers.ValidationError(
                MessageBag.FIELDS_DO_NOT_MATCH.format(field="Passwords")
            )
        return data

    def create(self, validated_data) -> User:
        user = User.objects.create(email=validated_data["email"])
        user.set_password(validated_data["password1"])
        user.save()
        return user
