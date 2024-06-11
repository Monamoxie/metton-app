from django.views import View
from core.services import EventService
from django.http import JsonResponse


class EventListBusinessHoursView(View):
    def get(self, request):
        data = EventService.get_business_hours(request.user)

        return JsonResponse(
            data=data,
            safe=False,
        )
