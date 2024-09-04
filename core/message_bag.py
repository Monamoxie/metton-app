from http.client import CREATED
from django.utils.translation import gettext_lazy as _


class MessageBag:
    # validation based messages
    FIELD_IS_REQUIRED = _("The {field} is required")
    DATA_IS_INVALID = _("The {data} is invalid")
    DATA_IS_VALID = _("The {data} is valid")
    FIELD_IS_DUPLICATE = _("A {field} with this value already exists")
    FIELDS_DO_NOT_MATCH = _("{field} do not match")
    DATA_IS_EXPIRED = _("The {data} is expired")
    SUCCESSFUL_DATA_VALIDATION = _("{data} has been successfully validated")

    # action based messages
    CREATED_SUCCESSFULLY = _("{data} created successfully")
    UPDATED_SUCCESSFULLY = _("{data} updated successfully")
    DELETED_SUCCESSFULLY = _("{data} deleted successfully")

    # Retrieval based messages
    DATA_RETURNED_SUCCESSFULLY = _("Data returned successfully")
    DATA_NOT_FOUND = _("{data} not found")
    UNABLE_TO_GENERATE_DATA = _("Unable to generate {data}")
