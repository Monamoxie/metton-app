from django.views import View
from core.services import EventService
from django.http import JsonResponse
from typing import List, Dict
from django.contrib.auth.mixins import LoginRequiredMixin


class EventListBusinessHoursView(LoginRequiredMixin, View):
    def get(self, request):
        data: List[Dict] = EventService.get_business_hours(request.user)

        return JsonResponse(
            data=data,
            safe=False,
        )
