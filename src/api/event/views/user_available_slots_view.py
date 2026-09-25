from datetime import datetime

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.message_bag import MessageBag
from event.exceptions import ScheduleNotFoundError
from event.serializers.available_slot_serializer import AvailableSlotSerializer
from event.services import AvailabilityService, ScheduleService
from identity.models.user import User


class UserAvailableSlotsView(APIView):
    """
    GET /api/v1/event/<public_id>/slots/?start=YYYY-MM-DD&end=YYYY-MM-DD&duration=30
    -> public, unauthenticated — the actual bookable slots for this host's default schedule.
    """

    permission_classes = [AllowAny]

    def get(self, request, public_id):
        user = User.objects.filter(public_id=public_id).first()
        if not user:
            return Response(
                {"_message": MessageBag.DATA_NOT_FOUND.format(data="User")},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            schedule = ScheduleService.get_default_for_user(user)
        except ScheduleNotFoundError:
            return Response({"slots": []}, status=status.HTTP_200_OK)

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

        try:
            duration_minutes = int(request.query_params.get("duration", 30))
        except ValueError:
            return Response(
                {"_message": MessageBag.DATA_IS_INVALID.format(data="duration")},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        if end_date < start_date:
            return Response(
                {"_message": MessageBag.DATA_IS_INVALID.format(data="end")},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        slots = AvailabilityService.get_available_slots(
            schedule, start_date, end_date, duration_minutes
        )

        return Response(
            {"slots": AvailableSlotSerializer(slots, many=True).data},
            status=status.HTTP_200_OK,
        )
