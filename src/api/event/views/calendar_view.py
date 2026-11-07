from datetime import datetime

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.message_bag import MessageBag
from event.serializers.calendar_booking_serializer import CalendarBookingSerializer
from event.serializers.calendar_unavailable_serializer import (
    CalendarUnavailableSerializer,
)
from event.services import CalendarService


class CalendarView(APIView):
    """
    GET /api/v1/event/calendar/?start=YYYY-MM-DD&end=YYYY-MM-DD
    -> the requester's own bookings (one entry per occurrence) and unavailable days in range.
    Results include a day either side of the range, since start/end are the viewer's local
    dates and the server doesn't know their timezone.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            start_date = datetime.strptime(
                request.query_params.get("start", ""), "%Y-%m-%d"
            ).date()
            end_date = datetime.strptime(
                request.query_params.get("end", ""), "%Y-%m-%d"
            ).date()
        except ValueError:
            return Response(
                {"_message": MessageBag.DATA_IS_INVALID.format(data="start/end")},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        if end_date < start_date or (
            (end_date - start_date).days > CalendarService.MAX_RANGE_DAYS
        ):
            return Response(
                {"_message": MessageBag.DATA_IS_INVALID.format(data="end")},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        return Response(
            {
                "bookings": CalendarBookingSerializer(
                    CalendarService.get_bookings(request.user, start_date, end_date),
                    many=True,
                ).data,
                "unavailable": CalendarUnavailableSerializer(
                    CalendarService.get_unavailable(request.user, start_date, end_date),
                    many=True,
                ).data,
            },
            status=status.HTTP_200_OK,
        )
