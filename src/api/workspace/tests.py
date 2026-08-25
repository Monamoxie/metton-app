from datetime import timedelta
from unittest.mock import patch

from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from identity.models.user import User
from workspace.enums import WorkspaceInvitationStatus, WorkspaceRoleName
from workspace.exceptions import (
    AlreadyWorkspaceMemberError,
    InvitationAlreadyAcceptedError,
    InvitationEmailMismatchError,
    InvitationExpiredError,
    InvitationNotFoundError,
    TeamLimitReachedError,
    WorkspaceLimitReachedError,
)
from workspace.models import (
    Team,
    TeamMembership,
    Workspace,
    WorkspaceInvitation,
    WorkspaceMembership,
    WorkspaceRole,
)
from workspace.services import (
    TeamMembershipService,
    TeamService,
    WorkspaceInvitationService,
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


class WorkspaceMemberListTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email="owner@example.com", password="password123"
        )
        WorkspaceRole.objects.get_or_create(
            name=WorkspaceRoleName.OWNER.value,
            defaults={"label": "owner", "is_system": True},
        )
        self.workspace = WorkspaceService.create_workspace(
            user=self.owner, name="Acme Corp"
        )
        self.url = f"/api/v1/workspace/{self.workspace.slug}/members/"
        self.client.force_authenticate(user=self.owner)

    def test_list_members_includes_the_owner(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        members = response.json()["data"]["members"]
        self.assertEqual(len(members), 1)
        self.assertEqual(members[0]["user"]["email"], self.owner.email)
        self.assertEqual(members[0]["role"], "Owner")

    def test_non_member_cannot_list_members(self):
        outsider = User.objects.create_user(
            email="outsider@example.com", password="password123"
        )
        self.client.force_authenticate(user=outsider)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class WorkspaceInvitationCreateTests(APITestCase):
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
        self.url = f"/api/v1/workspace/{self.workspace.slug}/invitations/"
        self.client.force_authenticate(user=self.owner)
        self.email_patcher = patch(
            "workspace.views.workspace_invitation_list_create_view.send_workspace_invite_email"
        )
        self.mock_send_email = self.email_patcher.start()
        self.addCleanup(self.email_patcher.stop)

    def test_creates_pending_invitation_and_sends_email(self):
        response = self.client.post(
            self.url,
            {"invites": [{"email": "newperson@example.com", "role": "member"}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        invitation = WorkspaceInvitation.objects.get(email="newperson@example.com")
        self.assertEqual(invitation.workspace, self.workspace)
        self.assertEqual(invitation.role, "Member")
        self.assertEqual(invitation.status, WorkspaceInvitationStatus.PENDING.value)
        self.mock_send_email.assert_called_once()

    def test_role_is_accepted_case_insensitively(self):
        response = self.client.post(
            self.url,
            {"invites": [{"email": "admin-invite@example.com", "role": "ADMIN"}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            WorkspaceInvitation.objects.get(email="admin-invite@example.com").role,
            "Admin",
        )

    def test_owner_role_is_rejected(self):
        response = self.client.post(
            self.url,
            {"invites": [{"email": "wannabe-owner@example.com", "role": "owner"}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)

    def test_inviting_an_existing_member_returns_400(self):
        member = User.objects.create_user(
            email="member@example.com", password="password123"
        )
        WorkspaceMembershipService.add_member(
            workspace=self.workspace,
            user=member,
            role_name=WorkspaceRoleName.MEMBER.value,
            invited_by=self.owner,
        )

        response = self.client.post(
            self.url,
            {"invites": [{"email": "member@example.com", "role": "member"}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reinviting_the_same_email_refreshes_the_token(self):
        self.client.post(
            self.url,
            {"invites": [{"email": "newperson@example.com", "role": "member"}]},
            format="json",
        )
        first_token = WorkspaceInvitation.objects.get(
            email="newperson@example.com"
        ).token

        self.client.post(
            self.url,
            {"invites": [{"email": "newperson@example.com", "role": "admin"}]},
            format="json",
        )

        self.assertEqual(
            WorkspaceInvitation.objects.filter(email="newperson@example.com").count(),
            1,
        )
        invitation = WorkspaceInvitation.objects.get(email="newperson@example.com")
        self.assertNotEqual(invitation.token, first_token)
        self.assertEqual(invitation.role, "Admin")

    def test_workspace_member_cannot_invite(self):
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

        response = self.client.post(
            self.url,
            {"invites": [{"email": "someone@example.com", "role": "member"}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_pending_invitations(self):
        self.client.post(
            self.url,
            {"invites": [{"email": "newperson@example.com", "role": "member"}]},
            format="json",
        )

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        invitations = response.json()["data"]["invitations"]
        self.assertEqual(len(invitations), 1)
        self.assertEqual(invitations[0]["email"], "newperson@example.com")


class WorkspaceInvitationPeekTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email="owner@example.com", password="password123"
        )
        WorkspaceRole.objects.get_or_create(
            name=WorkspaceRoleName.OWNER.value,
            defaults={"label": "owner", "is_system": True},
        )
        self.workspace = WorkspaceService.create_workspace(
            user=self.owner, name="Acme Corp"
        )
        invitations = WorkspaceInvitationService.create_invitations(
            workspace=self.workspace,
            invites=[{"email": "invitee@example.com", "role": "Member"}],
            invited_by=self.owner,
        )
        self.invitation = invitations[0]
        self.plain_token = self.invitation.plain_token

    def test_peek_returns_invitation_details_without_auth(self):
        response = self.client.get(
            f"/api/v1/workspace/invitations/{self.plain_token}/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()["data"]["invitation"]
        self.assertEqual(data["email"], "invitee@example.com")
        self.assertEqual(data["workspace_slug"], self.workspace.slug)

    def test_peek_unknown_token_returns_404(self):
        response = self.client.get("/api/v1/workspace/invitations/not-a-real-token/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_peek_expired_token_returns_400(self):
        self.invitation.expires_at = timezone.now() - timedelta(days=1)
        self.invitation.save(update_fields=["expires_at"])

        response = self.client.get(
            f"/api/v1/workspace/invitations/{self.plain_token}/"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class WorkspaceInvitationAcceptTests(APITestCase):
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
        self.default_team = Team.objects.get(workspace=self.workspace, is_default=True)
        invitations = WorkspaceInvitationService.create_invitations(
            workspace=self.workspace,
            invites=[{"email": "invitee@example.com", "role": "Member"}],
            invited_by=self.owner,
        )
        self.invitation = invitations[0]
        self.plain_token = self.invitation.plain_token
        self.invitee = User.objects.create_user(
            email="invitee@example.com", password="password123"
        )
        self.url = f"/api/v1/workspace/invitations/{self.plain_token}/accept/"

    def test_accept_creates_workspace_and_team_membership(self):
        self.client.force_authenticate(user=self.invitee)

        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            WorkspaceMembership.objects.filter(
                workspace=self.workspace, user=self.invitee, role__name="Member"
            ).exists()
        )
        self.assertTrue(
            TeamMembership.objects.filter(
                team=self.default_team, user=self.invitee
            ).exists()
        )
        self.invitation.refresh_from_db()
        self.assertEqual(
            self.invitation.status, WorkspaceInvitationStatus.ACCEPTED.value
        )
        self.assertIsNotNone(self.invitation.accepted_at)

    def test_accept_assigns_the_invitations_specified_team_not_default(self):
        other_team = TeamService.create_team(
            workspace=self.workspace, name="Engineering", created_by=self.owner
        )
        invitations = WorkspaceInvitationService.create_invitations(
            workspace=self.workspace,
            invites=[{"email": "eng-invitee@example.com", "role": "Member"}],
            invited_by=self.owner,
            team=other_team,
        )
        eng_invitee = User.objects.create_user(
            email="eng-invitee@example.com", password="password123"
        )
        self.client.force_authenticate(user=eng_invitee)

        response = self.client.post(
            f"/api/v1/workspace/invitations/{invitations[0].plain_token}/accept/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            TeamMembership.objects.filter(
                team=other_team, user=eng_invitee
            ).exists()
        )
        self.assertFalse(
            TeamMembership.objects.filter(
                team=self.default_team, user=eng_invitee
            ).exists()
        )

    def test_accept_with_wrong_logged_in_email_returns_403(self):
        wrong_user = User.objects.create_user(
            email="wrong@example.com", password="password123"
        )
        self.client.force_authenticate(user=wrong_user)

        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_accept_twice_returns_400_on_second_attempt(self):
        self.client.force_authenticate(user=self.invitee)
        self.client.post(self.url)

        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_accept_unknown_token_returns_404(self):
        self.client.force_authenticate(user=self.invitee)

        response = self.client.post(
            "/api/v1/workspace/invitations/not-a-real-token/accept/"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class WorkspaceInvitationServiceTests(TestCase):
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

    def test_create_invitations_raises_for_existing_member(self):
        member = User.objects.create_user(
            email="member@example.com", password="password123"
        )
        WorkspaceMembershipService.add_member(
            workspace=self.workspace,
            user=member,
            role_name=WorkspaceRoleName.MEMBER.value,
            invited_by=self.owner,
        )

        with self.assertRaises(AlreadyWorkspaceMemberError):
            WorkspaceInvitationService.create_invitations(
                workspace=self.workspace,
                invites=[{"email": "member@example.com", "role": "Member"}],
                invited_by=self.owner,
            )

    def test_peek_raises_for_unknown_token(self):
        with self.assertRaises(InvitationNotFoundError):
            WorkspaceInvitationService.peek("not-a-real-token")

    def test_accept_raises_for_already_accepted(self):
        invitations = WorkspaceInvitationService.create_invitations(
            workspace=self.workspace,
            invites=[{"email": "invitee@example.com", "role": "Member"}],
            invited_by=self.owner,
        )
        invitee = User.objects.create_user(
            email="invitee@example.com", password="password123"
        )
        WorkspaceInvitationService.accept(invitations[0].plain_token, invitee)

        with self.assertRaises(InvitationAlreadyAcceptedError):
            WorkspaceInvitationService.accept(invitations[0].plain_token, invitee)

    def test_accept_raises_for_email_mismatch(self):
        invitations = WorkspaceInvitationService.create_invitations(
            workspace=self.workspace,
            invites=[{"email": "invitee@example.com", "role": "Member"}],
            invited_by=self.owner,
        )
        wrong_user = User.objects.create_user(
            email="wrong@example.com", password="password123"
        )

        with self.assertRaises(InvitationEmailMismatchError):
            WorkspaceInvitationService.accept(invitations[0].plain_token, wrong_user)

    def test_expired_invitation_raises_on_accept(self):
        invitations = WorkspaceInvitationService.create_invitations(
            workspace=self.workspace,
            invites=[{"email": "invitee@example.com", "role": "Member"}],
            invited_by=self.owner,
        )
        invitation = invitations[0]
        invitation.expires_at = timezone.now() - timedelta(days=1)
        invitation.save(update_fields=["expires_at"])
        invitee = User.objects.create_user(
            email="invitee@example.com", password="password123"
        )

        with self.assertRaises(InvitationExpiredError):
            WorkspaceInvitationService.accept(invitations[0].plain_token, invitee)
