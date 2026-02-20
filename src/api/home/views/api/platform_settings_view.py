from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from home.serializers import PlatformSettingsSerializer


class PlatformSettingsView(RetrieveAPIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        serializer = PlatformSettingsSerializer(instance={})
        
        return Response(serializer.data)