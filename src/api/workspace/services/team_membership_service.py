from typing import TYPE_CHECKING

from dashboard.models import User
from workspace.models import Team, TeamMembership

if TYPE_CHECKING:
    from django.contrib.auth.models import AbstractBaseUser, AnonymousUser


class TeamMembershipService:
    @staticmethod
    def add_member(
        team: Team, user: User, role: str
    ) -> TeamMembership:
        return TeamMembership.objects.create(team=team, user=user, role=role)

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
