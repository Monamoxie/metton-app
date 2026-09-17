from typing import TYPE_CHECKING

from django.db.models import QuerySet

from identity.models import User
from workspace.enums import TeamMembershipRoleName
from workspace.models import Team, TeamMembership, Workspace

if TYPE_CHECKING:
    from django.contrib.auth.models import AbstractBaseUser, AnonymousUser


class TeamMembershipService:
    @staticmethod
    def add_member(
        team: Team, user: User, role: str
    ) -> TeamMembership:
        return TeamMembership.objects.create(team=team, user=user, role=role)

    @staticmethod
    def get_members_for_team(team: Team) -> QuerySet:
        return TeamMembership.objects.filter(team=team).select_related("user")

    @staticmethod
    def get_for_user_in_workspace(workspace: Workspace, user: User) -> TeamMembership | None:
        return (
            TeamMembership.objects.filter(team__workspace=workspace, user=user)
            .select_related("team")
            .first()
        )

    @staticmethod
    def get_team_map_for_workspace(workspace: Workspace) -> dict:
        """user_id -> Team, for every member with a team in this workspace."""
        memberships = TeamMembership.objects.filter(
            team__workspace=workspace
        ).select_related("team")
        return {membership.user_id: membership.team for membership in memberships}

    @staticmethod
    def move_member(workspace: Workspace, user: User, team: Team) -> TeamMembership:
        """Moves a user to `team`, removing their membership in any other team of this workspace."""
        TeamMembership.objects.filter(team__workspace=workspace, user=user).exclude(
            team=team
        ).delete()
        membership, _ = TeamMembership.objects.get_or_create(
            team=team,
            user=user,
            defaults={"role": TeamMembershipRoleName.MEMBER.value},
        )
        return membership

    @staticmethod
    def is_member(team: Team, user: "User | AbstractBaseUser | AnonymousUser") -> bool:
        if not hasattr(user, "is_authenticated") or not user.is_authenticated:
            return False

        return TeamMembership.objects.filter(team=team, user=user).exists()

    @staticmethod
    def has_role(
        team: Team, user: "User | AbstractBaseUser | AnonymousUser", role: str
    ) -> bool:
        if not hasattr(user, "is_authenticated") or not user.is_authenticated:
            return False

        return TeamMembership.objects.filter(team=team, user=user, role=role).exists()

    @staticmethod
    def remove_member(team: Team, user: User) -> None:
        TeamMembership.objects.filter(team=team, user=user).delete()
