from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.message_bag import MessageBag
from event.exceptions import InvalidWeeklyHoursError, ScheduleNotFoundError
from event.serializers.schedule_serializer import ScheduleSerializer
from event.serializers.schedule_update_serializer import ScheduleUpdateSerializer
from event.services import ScheduleService


class ScheduleDetailView(APIView):
    """
    GET   /api/v1/event/schedule/  -> the requester's own default schedule
    PATCH /api/v1/event/schedule/  -> create-or-update it (name/timezone/weekly_hours/booking_rules)
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            schedule = ScheduleService.get_default_for_user(request.user)
        except ScheduleNotFoundError:
            return Response(
                {"_message": MessageBag.DATA_NOT_FOUND.format(data="Schedule")},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {"schedule": ScheduleSerializer(schedule).data}, status=status.HTTP_200_OK
        )

    def patch(self, request):
        serializer = ScheduleUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        schedule = ScheduleService.get_or_create_default_for_user(request.user)

        for field in ("name", "timezone"):
            if field in serializer.validated_data:
                setattr(schedule, field, serializer.validated_data[field])
        schedule.save()

        if "weekly_hours" in serializer.validated_data:
            try:
                ScheduleService.replace_weekly_hours(
                    schedule, serializer.validated_data["weekly_hours"]
                )
            except InvalidWeeklyHoursError:
                return Response(
                    {"_message": MessageBag.DATA_IS_INVALID.format(data="weekly_hours")},
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                )

        if "booking_rules" in serializer.validated_data:
            ScheduleService.update_booking_rules(
                schedule, **serializer.validated_data["booking_rules"]
            )

        return Response(
            {
                "_message": MessageBag.UPDATED_SUCCESSFULLY.format(data="Schedule"),
                "schedule": ScheduleSerializer(schedule).data,
            },
            status=status.HTTP_200_OK,
        )
