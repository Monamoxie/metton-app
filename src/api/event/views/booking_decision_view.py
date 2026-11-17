from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.message_bag import MessageBag
from event.enums import EventTypes
from event.exceptions import BookingConflictError, BookingNotPendingError
from event.models import Event
from event.serializers.booking_serializer import BookingSerializer
from event.services import BookingService


class BookingDecisionView(APIView):
    """
    POST /api/v1/event/bookings/<booking_id>/accept/
    POST /api/v1/event/bookings/<booking_id>/decline/
    -> the host's decision on a pending booking. Only the booking's own host can decide.
    """

    permission_classes = [IsAuthenticated]
    # "accept" or "decline", set per route in urls.py
    action = ""

    def post(self, request, booking_id):
        booking = Event.objects.filter(
            id=booking_id, user=request.user, type=EventTypes.PUBLIC.value
        ).first()
        if not booking:
            return Response(
                {"_message": MessageBag.DATA_NOT_FOUND.format(data="Booking")},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            if self.action == "accept":
                booking = BookingService.accept_booking(booking)
            else:
                booking = BookingService.decline_booking(booking)
        except BookingNotPendingError:
            return Response(
                {"_message": "This booking has already been decided."},
                status=status.HTTP_409_CONFLICT,
            )
        except BookingConflictError:
            return Response(
                {
                    "_message": "This time now clashes with another booking, so it can't be accepted."
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        return Response(
            {
                "_message": MessageBag.UPDATED_SUCCESSFULLY.format(data="Booking"),
                "booking": BookingSerializer(booking).data,
            },
            status=status.HTTP_200_OK,
        )
