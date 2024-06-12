from django.http import JsonResponse
from django.views.generic import DeleteView
import json
from dashboard.models import Event
from dashboard.enums import EventTypes


class EventDeleteBusinessHoursView(DeleteView):
    def delete(self, request, *args, **kwargs):
        body = request.body.decode("utf-8")
        if "id" in body:
            data = json.loads(body)

        event = Event.objects.filter(
            user=request.user, id=data["id"], type=EventTypes.BUSINESS_HOURS.value
        ).first()

        if event:
            event.delete()
            return JsonResponse(data=[{"status": True}], safe=False)

        return JsonResponse(
            data=[{"status": True, "error": "Event not found or not deleted"}],
            status=400,
            safe=False,
        )
