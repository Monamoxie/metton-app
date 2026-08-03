from django.db import transaction
from django.db.models import QuerySet
from django.utils.text import slugify

from identity.models.user import User
from workspace.enums import TeamMembershipRoleName
from workspace.exceptions import TeamLimitReachedError, TeamNotFoundError
from workspace.models import Team, Workspace
from workspace.services.team_membership_service import TeamMembershipService


class TeamService:
    # A workspace may have at most this many teams.
    MAX_TEAMS_PER_WORKSPACE = 20

    DEFAULT_TEAM_NAME = "General"

    @classmethod
    def create_team(cls, workspace: Workspace, name: str, created_by: User) -> Team:
        if cls._team_count(workspace) >= cls.MAX_TEAMS_PER_WORKSPACE:
            raise TeamLimitReachedError()

        with transaction.atomic():
            team = Team.objects.create(
                workspace=workspace,
                name=name,
                slug=cls._generate_unique_slug(workspace, name),
            )
            TeamMembershipService.add_member(
                team=team, user=created_by, role=TeamMembershipRoleName.LEAD.value
            )

        return team

    @classmethod
    def create_default_team(cls, workspace: Workspace, owner: User) -> Team:
        team, _ = Team.objects.get_or_create(
            workspace=workspace,
            is_default=True,
            defaults={
                "name": cls.DEFAULT_TEAM_NAME,
                "slug": cls._generate_unique_slug(workspace, cls.DEFAULT_TEAM_NAME),
            },
        )

        if not TeamMembershipService.is_member(team, owner):
            TeamMembershipService.add_member(
                team=team, user=owner, role=TeamMembershipRoleName.LEAD.value
            )

        return team

    @staticmethod
    def get_teams_for_workspace(workspace: Workspace) -> QuerySet:
        return Team.objects.filter(workspace=workspace)

    @staticmethod
    def get_by_slug(workspace: Workspace, team_slug: str) -> Team:
        try:
            return Team.objects.get(workspace=workspace, slug=team_slug)
        except Team.DoesNotExist:
            raise TeamNotFoundError()

    @staticmethod
    def _team_count(workspace: Workspace) -> int:
        return Team.objects.filter(workspace=workspace).count()

    @staticmethod
    def _generate_unique_slug(workspace: Workspace, name: str) -> str:
        slug = slugify(name)
        counter = 1
        while Team.objects.filter(workspace=workspace, slug=slug).exists():
            slug = f"{slug}-{counter}"
            counter += 1
        return slug
