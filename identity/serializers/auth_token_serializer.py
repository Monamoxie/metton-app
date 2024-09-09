from knox.models import AuthToken
from rest_framework import serializers


class AuthTokenSerializer(serializers.ModelSerializer):
    token = serializers.CharField(required=False, allow_null=True)
    expiry = serializers.DateTimeField(required=False, allow_null=True)

    class Meta:
        model = AuthToken
        fields = ["token", "expiry"]
