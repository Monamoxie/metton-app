from django.core.management.base import BaseCommand
from django.utils.text import slugify
from workspace.enums import WorkspaceRoleName
from workspace.models.workspace_role import WorkspaceRole


class Command(BaseCommand):
    help = "Seed system-default workspace roles"

    SYSTEM_ROLES = [
        {"name": WorkspaceRoleName.OWNER.value},
        {"name": WorkspaceRoleName.OWNER.value},
        {"name": WorkspaceRoleName.OWNER.value},
    ]

    def handle(self, *args, **kwargs):
        for role_data in self.SYSTEM_ROLES:
            role, was_created = WorkspaceRole.objects.get_or_create(
                label=slugify(role_data["name"]),
                defaults={"name": role_data["name"], "is_system": True},
            )
            status = "created" if was_created else "already exists"
            self.stdout.write(f"  {role.label}: {status}")
