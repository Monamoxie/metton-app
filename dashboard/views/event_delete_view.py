from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
import json
from dashboard.models import Event
from django.http import JsonResponse


class EventDeleteView(LoginRequiredMixin, View):
    def post(self, request):
        body = request.body.decode("utf-8")
        if "id" in body:
            data = json.loads(body)
            event = Event.objects.filter(user=request.user, id=data["id"]).first()
            if event:
                event.delete()

            return JsonResponse(
                data=[{"status": True}],
                safe=False,
            )

        return JsonResponse(
            data=[{"status": False, "message": "Invalid ID or event not found"}],
            status=400,
        )
