from rest_framework import serializers


class PublicProfileSerializer(serializers.Serializer):
    name = serializers.CharField()
    company = serializers.CharField()
    position = serializers.CharField()
    profile_summary = serializers.CharField()
    profile_photo = serializers.SerializerMethodField()

    def get_profile_photo(self, user) -> str:
        return user.profile_photo.url if user.profile_photo else ""
