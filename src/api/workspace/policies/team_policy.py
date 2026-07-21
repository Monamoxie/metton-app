from rest_framework.permissions import BasePermission
from workspace.enums import WorkspaceRoleName
from workspace.services import WorkspaceMembershipService


class CanManageTeam(BasePermission):
    def has_object_permission(self, request, view, obj) -> bool:
        return WorkspaceMembershipService.has_role(
            obj, request.user, WorkspaceRoleName.OWNER.value
        ) or WorkspaceMembershipService.has_role(
            obj, request.user, WorkspaceRoleName.ADMIN.value
        )
