from typing import TYPE_CHECKING

from dashboard.models import User
from workspace.models import Workspace
from workspace.models import WorkspaceMembership
from workspace.models.workspace_role import WorkspaceRole

if TYPE_CHECKING:
    from django.contrib.auth.models import AbstractBaseUser, AnonymousUser


class WorkspaceMembershipService:
    @staticmethod
    def add_member(
        workspace: Workspace, user: User, role_name: str, invited_by: User
    ) -> WorkspaceMembership:
        role = WorkspaceRole.objects.get(name=role_name)
        return WorkspaceMembership.objects.create(
            workspace=workspace, user=user, role=role, invited_by=invited_by
        )

    @staticmethod
    def get_workspace(workspace: Workspace, user: "User | AbstractBaseUser | AnonymousUser") -> WorkspaceMembership | None:
        if not hasattr(user, 'is_authenticated') or not user.is_authenticated:
            return None

        return (
            WorkspaceMembership.objects.filter(workspace=workspace, user=user)
            .select_related("role")
            .first()
        )

    @staticmethod
    def is_member(workspace: Workspace, user: "User | AbstractBaseUser | AnonymousUser") -> bool:
        if not hasattr(user, 'is_authenticated') or not user.is_authenticated:
            return False

        return WorkspaceMembership.objects.filter(
            workspace=workspace, user=user
        ).exists()

    @staticmethod
    def has_role(workspace: Workspace, user: "User | AbstractBaseUser | AnonymousUser", role_name: str) -> bool:
        if not hasattr(user, 'is_authenticated') or not user.is_authenticated:
            return False

        return WorkspaceMembership.objects.filter(
            workspace=workspace, user=user, role__name=role_name
        ).exists()

    @staticmethod
    def has_system_role(workspace: Workspace, user: User) -> bool:
        return WorkspaceMembership.objects.filter(
            workspace=workspace, user=user, role__is_system=True
        ).exists()

    @staticmethod
    def change_role(
        membership: WorkspaceMembership, new_role_name: str
    ) -> WorkspaceMembership:
        membership.role = WorkspaceRole.objects.get(name=new_role_name)
        membership.save(update_fields=["role", "updated_at"])
        return membership

    @staticmethod
    def remove_member(workspace: Workspace, user: User) -> None:
        WorkspaceMembership.objects.filter(workspace=workspace, user=user).delete()
