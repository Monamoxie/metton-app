from http.client import CREATED
from django.utils.translation import gettext_lazy as _


class MessageBag:
    # validation based messages
    DATA_IS_INVALID = _("The {data} is invalid")
    DATA_NOT_ACTIVATED = _("{data} has not been activated or one of it's properties has not been provided")
    DATA_IS_EXPIRED = _("The {data} is expired")
    DATA_NOT_FOUND = _("{data} not found")
    DATA_VALIDATION_FAILURE = _("Unable to validate {data}")
    UNABLE_TO_GENERATE_DATA = _("Unable to generate {data}")

    DATA_IS_VALID = _("The {data} is valid")
    DATA_RETURNED_SUCCESSFULLY = _("Data returned successfully")
    DATA_ALREADY_VERIFIED = _("{data} is already verified")

    FIELD_IS_REQUIRED = _("The {field} is required")
    FIELD_IS_DUPLICATE = _("A {field} with this value already exists")
    FIELDS_DO_NOT_MATCH = _("{field} do not match")
    
    SUCCESSFUL_DATA_VALIDATION = _("{data} has been successfully validated") # todo ::: DATA_VALIDATION_SUCCESS
   
    INVALID_REQUEST = _("Invalid request") # todo ::: REQUEST_INVALID
    

    # action based messages
    CREATED_SUCCESSFULLY = _("{data} created successfully")
    UPDATED_SUCCESSFULLY = _("{data} updated successfully")
    DELETED_SUCCESSFULLY = _("{data} deleted successfully")
    SENT_SUCCESSFULLY = _("{data} has been sent successfully")
    SENT_SUCCESSFULLY_IF = _(
        SENT_SUCCESSFULLY + ", if the {channel} is valid and available"
    )

    # Generic messages
    GENERIC_ERROR_MESSAGE = _("An error occurred while processing your request")
    GENERIC_SUCCESS_MESSAGE = _("Action completed successfully")

    # Authentication based messages
    INVALID_SIGNIN_CREDENTIALS = _("Invalid email or password")
    INVALID_PASSWORD = _("Invalid password")
