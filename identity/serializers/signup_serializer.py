from curses.ascii import EM
from rest_framework import serializers
from dashboard.models.user import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

EMAIL_ERROR_MESSAGE = _("The email field is required.")
PASSWORD_ERROR_MESSAGE = _("The password field is required.")
PASSWORD_CONFIRMATION_ERROR_MESSAGE = _("Passwords do not match.")


class SignupSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True, error_messages={"required": EMAIL_ERROR_MESSAGE}
    )
    password1 = serializers.CharField(
        write_only=True,
        required=True,
        error_messages={"required": PASSWORD_ERROR_MESSAGE},
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        error_messages={"required": PASSWORD_CONFIRMATION_ERROR_MESSAGE},
    )

    class Meta:
        model = get_user_model()
        fields = ["email", "password1", "password2"]

    def validate_email(self, value):
        user_model = get_user_model()
        if user_model.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, data):
        if data["password1"] != data["password2"]:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data) -> User:
        user = User.objects.create(email=validated_data["email"])
        user.set_password(validated_data["password1"])
        user.save()
        return user
