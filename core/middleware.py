from typing import Union
from django.http import JsonResponse
from rest_framework import status
from rest_framework.response import Response
from django.utils.deprecation import MiddlewareMixin
from django.utils.translation import gettext_lazy as _

from core.message_bag import MessageBag


class ApiResponseMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        try:
            if isinstance(response, Response):
                data = response.data

            # todo ::: temporarily disabled until complete migration from Django to DRF is complete.
            # this is to ensure that Django JsonResponse is not altered by this middlware since the vanilla JS frontend still depends on the structure of the response
            # elif isinstance(response, JsonResponse):
            #     data = response.json()

            status_code = response.status_code
            custom_response = {
                "message": self._extract_message(data, status_code),
                "data": data if status_code < 400 else None,
                "errors": data if status_code >= 400 else None,
                "code": status_code,
            }

            return JsonResponse(custom_response, status=status_code)
        except Exception as e:
            # todo ::: Log the exception or handle it as needed
            pass

        # Return other types of responses unmodified
        return response

    def _extract_message(self, data, status_code: int) -> str:
        if isinstance(data, dict) and "_message" in data:
            return data.pop("_message", None)

        if status_code == status.HTTP_200_OK:
            return MessageBag.GENERIC_SUCCESS_MESSAGE
        else:
            return MessageBag.GENERIC_ERROR_MESSAGE
