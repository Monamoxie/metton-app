from http.client import CREATED
from django.utils.translation import gettext_lazy as _


class MessageBag:
    FIELD_IS_REQUIRED = _("The {field} is required")
    FIELD_IS_INVALID = _("The {field} is invalid")
    FIELD_IS_DUPLICATE = _("A {field} with this value already exists")
    FIELDS_DO_NOT_MATCH = _("{field} do not match")

    CREATED_SUCCESSFULLY = _("{data} created successfully")
