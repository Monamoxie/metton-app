from rest_framework import serializers
from knox.models import AuthToken
from dashboard.models.user import User
from .auth_token_serializer import AuthTokenSerializer


class UserSerializer(serializers.ModelSerializer):
    token = serializers.SerializerMethodField(required=False, allow_null=True)
    tokens = serializers.SerializerMethodField(required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "date_joined",
            "token",
            "tokens",
        ]

    def get_token(self, obj):
        """Return the token if provided in the context."""
       
        token = self.context.get("token")  # Retrieve token from context if set
        return AuthTokenSerializer(token).data if token else None

    def get_tokens(self, obj):
        tokens = AuthToken.objects.filter(user=obj)
        return AuthTokenSerializer(tokens, many=True).data

    def __init__(self, *args, **kwargs):
        token = kwargs.pop("token", None)
        super(UserSerializer, self).__init__(*args, **kwargs)
        if token:
            self.context["token"] = AuthTokenSerializer(token)
