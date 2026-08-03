from django.db import transaction
from django.db.models import QuerySet
from django.utils.text import slugify

from identity.models.user import User
from workspace.enums import WorkspaceRoleName
from workspace.exceptions import (
    SlugAlreadyTakenError,
    WorkspaceLimitReachedError,
    WorkspaceNotFoundError,
)
from workspace.models import Workspace
from workspace.models.workspace_membership import WorkspaceMembership
from workspace.models.workspace_role import WorkspaceRole
from workspace.signals import workspace_created


class WorkspaceService:
    # One user may *own* at most this many workspaces.
    MAX_WORKSPACES_PER_OWNER = 1

    @classmethod
    def create_workspace(
        cls, user: User, name: str, timezone: str = "UTC"
    ) -> Workspace:
        if cls._owned_workspace_count(user) >= cls.MAX_WORKSPACES_PER_OWNER:
            raise WorkspaceLimitReachedError()

        with transaction.atomic():
            workspace = Workspace.objects.create(
                name=name,
                slug=cls._generate_unique_slug(name),
                created_by=user,
                timezone=timezone,
            )
            owner_role = WorkspaceRole.objects.get(
                name=WorkspaceRoleName.OWNER.value,
            )
            WorkspaceMembership.objects.create(
                user=user, workspace=workspace, role=owner_role, invited_by=None
            )

        workspace_created.send(sender=cls, workspace=workspace, user=user)
        return workspace

    @staticmethod
    def _owned_workspace_count(user: User) -> int:
        return Workspace.objects.filter(created_by=user).count()

    @staticmethod
    def get_workspaces_for_user(user: User) -> QuerySet:
        return Workspace.objects.filter(memberships__user=user).select_related(
            "created_by"
        )

    @staticmethod
    def get_by_slug(slug: str, user: User) -> Workspace:
        try:
            return Workspace.objects.get(slug=slug, memberships__user=user)
        except Workspace.DoesNotExist:
            raise WorkspaceNotFoundError()

    @staticmethod
    def update(workspace: Workspace, data: dict) -> Workspace:
        for field, value in data.items():
            setattr(workspace, field, value)
        workspace.save()
        return workspace

    @staticmethod
    def update_slug(workspace: Workspace, new_slug: str) -> Workspace:
        slug = slugify(new_slug)
        if Workspace.objects.filter(slug=slug).exclude(pk=workspace.pk).exists():
            raise SlugAlreadyTakenError(f"The slug '{slug}' is already in use.")
        workspace.slug = slug
        workspace.save(update_fields=["slug", "updated_at"])
        return workspace

    @staticmethod
    def _generate_unique_slug(name: str) -> str:
        slug = slugify(name)
        counter = 1
        while Workspace.objects.filter(slug=slug).exists():
            slug = f"{slug}-{counter}"
            counter += 1
        return slug
