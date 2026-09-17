from rest_framework.permissions import BasePermission
from workspace.enums import WorkspaceRoleName
from workspace.services import WorkspaceMembershipService


class CanManageTeam(BasePermission):

    def has_object_permission(self, request, view, obj) -> bool:
        return WorkspaceMembershipService.has_any_role(
            obj,
            request.user,
            {
                WorkspaceRoleName.OWNER.value,
                WorkspaceRoleName.ADMIN.value,
                WorkspaceRoleName.MANAGER.value,
            },
        )
