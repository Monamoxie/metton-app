from django.views import View
from django.http import JsonResponse
from core.services.event_service import EventService


class UserEventsView(View):
    def get(self, request, public_id):
        data = EventService.get_events(inputs=request.GET, public_id=public_id)

        return JsonResponse(
            data=data,
            safe=False,
        )
