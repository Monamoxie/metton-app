from click import BaseCommand
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
            WorkspaceRole.objects.get_or_create(
                slug=slugify(role_data["name"]),
                defaults={"name": role_data["name"], 
                "is_system": True},
            )
