from django.dispatch import receiver

from workspace.services import TeamService
from workspace.signals import workspace_created


@receiver(workspace_created)
def create_default_team(sender, workspace, user, **kwargs):
    TeamService.create_default_team(workspace=workspace, owner=user)
