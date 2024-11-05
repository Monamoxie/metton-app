from rest_framework import serializers
from core.message_bag import MessageBag
from dashboard.models.user import User


class UserSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(
        required=True,
        error_messages={
            "required": MessageBag.FIELD_IS_REQUIRED.format(field="First name")
        },
    )
    last_name = serializers.CharField(
        required=True,
        error_messages={
            "required": MessageBag.FIELD_IS_REQUIRED.format(field="Last name")
        },
    )
    company = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = [
            "public_id",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "position",
            "company",
            "profile_summary",
            "date_joined",
        ]
        read_only_fields = ["id", "email", "date_joined"]
