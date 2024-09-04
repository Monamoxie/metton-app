from rest_framework import permissions


class GuestOnly(permissions.BasePermission):
    """
    Custom permission to only allow non-authenticated users (guests).
    """

    def has_permission(self, request, view):
        return not request.user.is_authenticated
