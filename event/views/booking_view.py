from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from dashboard.enums import EventTypes
from dashboard.models import Event
from dashboard.models.user import User
from core.services.event_service import EventService
from home.forms.booking_form import BookingForm

class BookingView(APIView):
    def post(self, request, public_id, *args, **kwargs):
        user = User.objects.filter(public_id=public_id).first()
        data = request.data

        form = BookingForm(data=data, user=user)

        if form.is_valid():
            event = form.save(commit=False)
            event.user = user
            event.type = EventTypes.PUBLIC.value
            event.timezone = EventService.extract_user_timezone(data=data)
            event.save()
            return Response({"message": "Booking completed", "errors": []}, status=status.HTTP_200_OK)
        else:
            return Response(
                {"message": "Please fix the following errors", "errors": form.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )