from datetime import datetime

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.message_bag import MessageBag
from event.exceptions import OverrideAlreadyExistsError, OverrideNotFoundError
from event.serializers.schedule_override_serializer import ScheduleOverrideSerializer
from event.services import ScheduleService


class ScheduleOverrideView(APIView):
    """
    POST   /api/v1/event/schedule/overrides/        -> add a date override
    DELETE /api/v1/event/schedule/overrides/<date>/  -> remove one
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ScheduleOverrideSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        schedule = ScheduleService.get_or_create_default_for_user(request.user)

        try:
            override = ScheduleService.add_override(
                schedule,
                date=serializer.validated_data["date"],
                is_unavailable=serializer.validated_data.get("is_unavailable", True),
                start_time=serializer.validated_data.get("start_time"),
                end_time=serializer.validated_data.get("end_time"),
            )
        except OverrideAlreadyExistsError:
            return Response(
                {"_message": MessageBag.FIELD_IS_DUPLICATE.format(field="date")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "_message": MessageBag.CREATED_SUCCESSFULLY.format(data="Override"),
                "override": ScheduleOverrideSerializer(override).data,
            },
            status=status.HTTP_201_CREATED,
        )

    def delete(self, request, date):
        try:
            parsed_date = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"_message": MessageBag.DATA_IS_INVALID.format(data="date")},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        schedule = ScheduleService.get_or_create_default_for_user(request.user)

        try:
            ScheduleService.remove_override(schedule, parsed_date)
        except OverrideNotFoundError:
            return Response(
                {"_message": MessageBag.DATA_NOT_FOUND.format(data="Override")},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {"_message": MessageBag.DELETED_SUCCESSFULLY.format(data="Override")},
            status=status.HTTP_200_OK,
        )
