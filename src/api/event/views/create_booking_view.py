from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.message_bag import MessageBag
from event.exceptions import BookingConflictError
from event.serializers.booking_create_serializer import BookingCreateSerializer
from event.serializers.booking_serializer import BookingSerializer
from event.services import BookingService
from identity.models.user import User


class CreateBookingView(APIView):
    """
    POST /api/v1/event/<public_id>/book/
    -> public, unauthenticated — a guest booking time with this host.
    """

    permission_classes = [AllowAny]

    def post(self, request, public_id):
        host = User.objects.filter(public_id=public_id).first()
        if not host:
            return Response(
                {"_message": MessageBag.DATA_NOT_FOUND.format(data="User")},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = BookingCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        try:
            booking = BookingService.create_booking(host, serializer.validated_data)
        except BookingConflictError:
            return Response(
                {
                    "_message": "This time slot is no longer available. Please choose another time."
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        return Response(
            {
                "_message": MessageBag.CREATED_SUCCESSFULLY.format(data="Booking"),
                "booking": BookingSerializer(booking).data,
            },
            status=status.HTTP_201_CREATED,
        )
