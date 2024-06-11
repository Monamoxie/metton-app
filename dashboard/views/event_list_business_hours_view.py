from django.views import View
from core.services import EventService
from django.http import JsonResponse
from typing import List, Dict


class EventListBusinessHoursView(View):
    def get(self, request):
        data: List[Dict] = EventService.get_business_hours(request.user)

        return JsonResponse(
            data=data,
            safe=False,
        )
