"""
Type definitions for workspace app.
Provides proper type hints for DRF request.user with custom User model.
"""
from rest_framework.request import Request as DRFRequest
from identity.models import User


class AuthenticatedRequest(DRFRequest):
    """
    Custom DRF Request type that specifies the authenticated user type.

    Use this in views/permissions where you know the user is authenticated.
    This gives proper type checking and IDE autocompletion for your custom User model.

    Example:
        def my_view(request: AuthenticatedRequest):
            # request.user is properly typed as User, not AbstractBaseUser
            username = request.user.name  # Type checker knows about User fields
    """

