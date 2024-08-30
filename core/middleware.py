from django.http import JsonResponse
from rest_framework.response import Response
from django.utils.deprecation import MiddlewareMixin
from django.utils.translation import gettext_lazy as _


class ApiResponseMiddleware(MiddlewareMixin):
    SUCCESS_MESSAGE = _("success")
    ERROR_MESSAGE = _("error")

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
                "data": data if status_code < 400 else None,
                "error": data if status_code >= 400 else None,
                "status": (
                    self.SUCCESS_MESSAGE if status_code < 400 else self.ERROR_MESSAGE
                ),
                "code": status_code,
            }

            return JsonResponse(custom_response, status=status_code)
        except Exception as e:
            # todo ::: Log the exception or handle it as needed
            pass

        # Return other types of responses unmodified
        return response
