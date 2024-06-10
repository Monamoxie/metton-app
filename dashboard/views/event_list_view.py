from django.views import View
from django.http import JsonResponse
from core.services import EventService


class EventListView(View):
    def get(self, request):
        return JsonResponse(
            EventService.get_events(request.GET, request.user.public_id), safe=False
        )
