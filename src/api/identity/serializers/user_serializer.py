from rest_framework import serializers
from core.message_bag import MessageBag
from dashboard.models.user import User
from dashboard.enums import ImageUploadTypes
from core import settings

class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        required=True,
        error_messages={"required": MessageBag.FIELD_IS_REQUIRED.format(field="name")},
    )
    company = serializers.CharField(required=False)
    position = serializers.CharField(required=False)
    profile_summary = serializers.CharField(required=False)
    profile_photo = serializers.ImageField(
        required=False, allow_null=True, use_url=False
    )
    remove_profile_photo = serializers.BooleanField(required=False, write_only=True)

    class Meta:
        model = User
        fields = [
            "public_id",
            "email",
            "name",
            "is_active",
            "position",
            "company",
            "remove_profile_photo",
            "profile_summary",
            "profile_photo",
            "date_joined",
            "email_verified"
        ]
        read_only_fields = [
            "id",
            "email",
            "date_joined",
            "public_id",
            "email_verified",
            "is_active",
            "email_verified"
        ]

    def validate_profile_photo(self, value):

        if value and hasattr(value, "content_type"):
            if value.content_type not in ImageUploadTypes.get_values():
                raise serializers.ValidationError(
                    f"Only {ImageUploadTypes.get_names_as_string()} formats are supported"
                )

            if value.size > 5 * 1024 * 1024:  # 5MB limit
                raise serializers.ValidationError(
                    "Photo size should not be more than 5 MB"
                )

            return value

        return None

    def update(self, instance, validated_data):
        remove_photo = validated_data.pop("remove_profile_photo", False)

        if remove_photo:
            # Delete the existing photo if it exists
            if instance.profile_photo:
                instance.profile_photo.delete(save=False)

            instance.profile_photo = None
            instance.save()

        return super().update(instance, validated_data)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.profile_photo:
            representation["profile_photo"] = (
                f"{settings.BASE_URL}{settings.MEDIA_URL}{instance.profile_photo.name}"
            )
        return representation
