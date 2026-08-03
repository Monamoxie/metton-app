from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from identity.models.user import User
from workspace.enums import WorkspaceRoleName
from workspace.exceptions import TeamLimitReachedError, WorkspaceLimitReachedError
from workspace.models import (
    Team,
    TeamMembership,
    Workspace,
    WorkspaceMembership,
    WorkspaceRole,
)
from workspace.services import (
    TeamMembershipService,
    TeamService,
    WorkspaceMembershipService,
    WorkspaceService,
)
from workspace.signals import workspace_created


class WorkspaceCreateTests(APITestCase):
    url = "/api/v1/workspace/"

    def setUp(self):
        self.user = User.objects.create_user(
            email="owner@example.com", password="password123"
        )
        WorkspaceRole.objects.get_or_create(
            name=WorkspaceRoleName.OWNER.value,
            defaults={"label": "owner", "is_system": True},
        )
        self.client.force_authenticate(user=self.user)

    def test_create_workspace_returns_201_and_creates_owner_membership(self):
        response = self.client.post(self.url, {"name": "Acme Corp"})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        workspace = Workspace.objects.get(name="Acme Corp")
        self.assertEqual(workspace.created_by, self.user)
        self.assertTrue(
            WorkspaceMembership.objects.filter(
                workspace=workspace, user=self.user, role__name="Owner"
            ).exists()
        )

    def test_slug_is_auto_generated_and_unique(self):
        first = self.client.post(self.url, {"name": "Acme Corp"})
        self.client.force_authenticate(user=self.user)

        second_user = User.objects.create_user(
            email="second@example.com", password="password123"
        )
        self.client.force_authenticate(user=second_user)
        second = self.client.post(self.url, {"name": "Acme Corp"})

        self.assertNotEqual(
            first.json()["data"]["workspace"]["slug"],
            second.json()["data"]["workspace"]["slug"],
        )

    def test_second_workspace_for_same_owner_returns_400(self):
        self.client.post(self.url, {"name": "Acme Corp"})
        response = self.client.post(self.url, {"name": "Second Workspace"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Workspace.objects.filter(created_by=self.user).count(), 1)

    def test_missing_name_returns_422(self):
        response = self.client.post(self.url, {})

        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)

    def test_list_workspaces_returns_only_the_users_workspaces(self):
        self.client.post(self.url, {"name": "Acme Corp"})

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()["data"]["workspaces"]), 1)


class WorkspaceServiceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="owner@example.com", password="password123"
        )
        WorkspaceRole.objects.get_or_create(
            name=WorkspaceRoleName.OWNER.value,
            defaults={"label": "owner", "is_system": True},
        )

    def test_workspace_created_signal_fires_after_save(self):
        received = []

        def handler(sender, workspace, user, **kwargs):
            received.append((workspace, user))

        # weak=False: without it Django holds only a weak reference to the
        # receiver, and since nothing else here keeps `handler` alive, it can
        # be garbage-collected before `send()` fires - the signal is emitted
        # but silently has zero listeners.
        workspace_created.connect(handler, weak=False)

        workspace = WorkspaceService.create_workspace(user=self.user, name="Acme Corp")

        self.assertEqual(len(received), 1)
        self.assertEqual(received[0][0], workspace)
        self.assertEqual(received[0][1], self.user)

    def test_create_workspace_raises_when_limit_reached(self):
        WorkspaceService.create_workspace(user=self.user, name="Acme Corp")

        with self.assertRaises(WorkspaceLimitReachedError):
            WorkspaceService.create_workspace(user=self.user, name="Another One")


class TeamCreateTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email="owner@example.com", password="password123"
        )
        WorkspaceRole.objects.get_or_create(
            name=WorkspaceRoleName.OWNER.value,
            defaults={"label": "owner", "is_system": True},
        )
        WorkspaceRole.objects.get_or_create(
            name=WorkspaceRoleName.MEMBER.value,
            defaults={"label": "member", "is_system": True},
        )
        self.workspace = WorkspaceService.create_workspace(
            user=self.owner, name="Acme Corp"
        )
        self.url = f"/api/v1/workspace/{self.workspace.slug}/teams/"
        self.client.force_authenticate(user=self.owner)

    def test_post_creates_a_team_scoped_to_the_workspace(self):
        response = self.client.post(self.url, {"name": "Engineering"})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Team.objects.filter(
                workspace=self.workspace, name="Engineering"
            ).exists()
        )

    def test_creator_is_added_as_team_lead(self):
        response = self.client.post(self.url, {"name": "Engineering"})

        team = Team.objects.get(id=response.json()["data"]["team"]["id"])
        self.assertTrue(
            TeamMembership.objects.filter(
                team=team, user=self.owner, role="lead"
            ).exists()
        )

    def test_workspace_member_cannot_create_a_team(self):
        member = User.objects.create_user(
            email="member@example.com", password="password123"
        )
        WorkspaceMembershipService.add_member(
            workspace=self.workspace,
            user=member,
            role_name=WorkspaceRoleName.MEMBER.value,
            invited_by=self.owner,
        )
        self.client.force_authenticate(user=member)

        response = self.client.post(self.url, {"name": "Engineering"})

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_exceeding_team_limit_returns_400(self):
        # workspace already has 1 team (the auto-created default) - create 19
        # more to reach the 20-team limit, then the next one should be rejected.
        for i in range(19):
            TeamService.create_team(
                workspace=self.workspace, name=f"Team {i}", created_by=self.owner
            )

        response = self.client.post(self.url, {"name": "One Too Many"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Team.objects.filter(workspace=self.workspace).count(), 20)

    def test_list_teams_includes_the_auto_created_default_team(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        teams = response.json()["data"]["teams"]
        self.assertEqual(len(teams), 1)
        self.assertEqual(teams[0]["name"], "General")
        self.assertTrue(teams[0]["is_default"])


class TeamMemberListTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email="owner@example.com", password="password123"
        )
        WorkspaceRole.objects.get_or_create(
            name=WorkspaceRoleName.OWNER.value,
            defaults={"label": "owner", "is_system": True},
        )
        WorkspaceRole.objects.get_or_create(
            name=WorkspaceRoleName.MEMBER.value,
            defaults={"label": "member", "is_system": True},
        )
        self.workspace = WorkspaceService.create_workspace(
            user=self.owner, name="Acme Corp"
        )
        self.team = Team.objects.get(workspace=self.workspace, is_default=True)
        self.url = (
            f"/api/v1/workspace/{self.workspace.slug}/teams/{self.team.slug}/members/"
        )
        self.client.force_authenticate(user=self.owner)

    def test_list_members_includes_the_team_lead(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        members = response.json()["data"]["members"]
        self.assertEqual(len(members), 1)
        self.assertEqual(members[0]["user"]["email"], self.owner.email)
        self.assertEqual(members[0]["role"], "lead")

    def test_list_members_reflects_added_member(self):
        member = User.objects.create_user(
            email="member@example.com", password="password123"
        )
        TeamMembershipService.add_member(team=self.team, user=member, role="member")

        response = self.client.get(self.url)

        members = response.json()["data"]["members"]
        self.assertEqual(len(members), 2)

    def test_returns_404_for_unknown_team_slug(self):
        response = self.client.get(
            f"/api/v1/workspace/{self.workspace.slug}/teams/nonexistent/members/"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_non_member_of_workspace_cannot_list_team_members(self):
        outsider = User.objects.create_user(
            email="outsider@example.com", password="password123"
        )
        self.client.force_authenticate(user=outsider)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class TeamServiceTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email="owner@example.com", password="password123"
        )
        WorkspaceRole.objects.get_or_create(
            name=WorkspaceRoleName.OWNER.value,
            defaults={"label": "owner", "is_system": True},
        )

    def test_default_team_is_created_after_workspace_created_signal(self):
        workspace = WorkspaceService.create_workspace(user=self.owner, name="Acme Corp")

        team = Team.objects.get(workspace=workspace)
        self.assertTrue(team.is_default)
        self.assertEqual(team.name, "General")
        self.assertTrue(
            TeamMembership.objects.filter(
                team=team, user=self.owner, role="lead"
            ).exists()
        )

    def test_default_team_creation_is_idempotent(self):
        workspace = WorkspaceService.create_workspace(user=self.owner, name="Acme Corp")

        # simulate the signal firing a second time for the same workspace
        workspace_created.send(sender=None, workspace=workspace, user=self.owner)

        self.assertEqual(Team.objects.filter(workspace=workspace).count(), 1)

    def test_create_team_raises_when_limit_reached(self):
        workspace = WorkspaceService.create_workspace(user=self.owner, name="Acme Corp")
        # workspace already has 1 team (default) - fill up to the limit
        for i in range(19):
            TeamService.create_team(
                workspace=workspace, name=f"Team {i}", created_by=self.owner
            )

        with self.assertRaises(TeamLimitReachedError):
            TeamService.create_team(
                workspace=workspace, name="One Too Many", created_by=self.owner
            )
