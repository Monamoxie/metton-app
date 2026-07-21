from django.db import models

from core import settings
from workspace.enums import TeamMembershipRoleName
from workspace.models.team import Team


class TeamMembership(models.Model):
    ROLE_CHOICES = [
        (TeamMembershipRoleName.LEAD.value, "Lead"),
        (TeamMembershipRoleName.MEMBER.value, "Member"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="team_memberships",
    )
    team = models.ForeignKey(
        Team, on_delete=models.CASCADE, related_name="memberships"
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "workspace_team_memberships"
        unique_together = ("user", "team")
