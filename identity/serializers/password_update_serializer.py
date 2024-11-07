from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from dashboard.models.user import User
from core.message_bag import MessageBag


class PasswordUpdateSerializer(serializers.Serializer):
    current_password = serializers.CharField(
        required=True,
        error_messages={
            "required": MessageBag.FIELD_IS_REQUIRED.format(field="Current Password")
        },
    )
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password],
        error_messages={
            "required": MessageBag.FIELD_IS_REQUIRED.format(field="New Password")
        },
    )
    confirm_new_password = serializers.CharField(
        required=True,
        error_messages={
            "required": MessageBag.FIELD_IS_REQUIRED.format(
                field="Confirm New Password"
            )
        },
    )

    # class Meta:
    #     model = User
    #     fields = ["password"]

    def validate(self, data):
        user = self.context["request"].user
        if not user.check_password(data["current_password"]):
            raise serializers.ValidationError(
                {
                    "current_password": MessageBag.DATA_IS_INVALID.format(
                        data="Current Password"
                    )
                }
            )

        if data["new_password"] != data["confirm_new_password"]:
            raise serializers.ValidationError(
                {
                    "confirm_new_password": MessageBag.FIELDS_DO_NOT_MATCH.format(
                        field="New Password and Confirm New Password"
                    )
                }
            )

        return data

    def update(self, instance, validated_data):
        instance.set_password(validated_data["new_password"])
        instance.save()
        return instance

    def to_representation(self, instance):
        return {}
