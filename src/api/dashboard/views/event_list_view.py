from django.views import View
from django.http import JsonResponse
from core.services import EventService
from django.contrib.auth.mixins import LoginRequiredMixin


class EventListView(LoginRequiredMixin, View):
    def get(self, request):
        return JsonResponse(
            EventService.get_events(request.GET, request.user.public_id), safe=False
        )
