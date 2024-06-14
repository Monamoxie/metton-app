from typing import Any, Union
from django.http import HttpRequest, HttpResponse
from django.views.generic import CreateView
import json
from core.services.event_service import EventService
from dashboard.enums import EventTypes
from dashboard.models import Event
from dashboard.models.user import User
from home.forms.booking_form import BookingForm
from django.http import JsonResponse


class BookingView(CreateView):
    public_id: Any
    data: dict
    user: Union[User, None]

    model = Event

    def post(self, request: HttpRequest, *args, **kwargs) -> HttpResponse:
        self.public_id = kwargs.get("public_id")
        self.data = json.loads(request.body.decode("utf-8"))
        self.user = User.objects.filter(public_id=self.public_id).first()

        form = BookingForm(data=self.data, user=self.user)

        if form.is_valid():
            return self.form_valid(form)
        else:
            return self.form_invalid(form)

    def form_valid(self, form):
        event = form.save(commit=False)

        event.user = self.user
        event.type = EventTypes.PUBLIC.value
        event.timezone = EventService.extract_user_timezone(data=self.data)
        event.save()

        return JsonResponse({"message": "Booking completed", "errors": []}, status=200)

    def form_invalid(self, form):
        return JsonResponse(
            {"message": "Please fix the following errors", "errors": form.errors},
            status=400,
        )
