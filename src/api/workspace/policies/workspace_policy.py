from rest_framework.permissions import BasePermission
from workspace.enums import WorkspaceRoleName
from workspace.services import WorkspaceMembershipService


class IsWorkspaceMember(BasePermission):
    def has_object_permission(self, request, view, obj) -> bool:
        return WorkspaceMembershipService.is_member(obj, request.user)


class CanUpdateWorkspace(BasePermission):
    """Owner or Admin only — administrative actions Manager doesn't get, e.g. granting or
    revoking another member's role."""

    def has_object_permission(self, request, view, obj) -> bool:
        return WorkspaceMembershipService.has_any_role(
            obj,
            request.user,
            {WorkspaceRoleName.OWNER.value, WorkspaceRoleName.ADMIN.value},
        )
