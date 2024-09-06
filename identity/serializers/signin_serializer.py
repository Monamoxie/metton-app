from rest_framework import serializers
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
        validators=[validate_password],
    )

    remember_me = serializers.BooleanField(default=False, required=False)

    class Meta:
        model = User
        fields = ["email", "password", "remember_me"]

    def validate(self, data):
        user = authenticate(email=data["email"], password=data["password"])
        if not user:
            raise serializers.ValidationError(
                {"authentication": MessageBag.INVALID_SIGNIN_CREDENTIALS}
            )
        data["user"] = user

        return data
