from django.views import View
from django.http import JsonResponse
from core.services.event_service import EventService


class UserBusinessHoursView(View):
    def get(self, request, public_id):
        data = EventService.get_business_hours(user=None, public_id=public_id)

        return JsonResponse(
            data=data,
            safe=False,
        )
