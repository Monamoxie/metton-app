from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from dashboard.models.user import User
from workspace.enums import WorkspaceRoleName
from workspace.exceptions import WorkspaceLimitReachedError
from workspace.models import Workspace, WorkspaceMembership, WorkspaceRole
from workspace.services import WorkspaceService
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
            first.data["data"]["workspace"]["slug"],
            second.data["data"]["workspace"]["slug"],
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
        self.assertEqual(len(response.data["data"]["workspaces"]), 1)


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
        workspace_created.connect(
            lambda sender, workspace, user, **kwargs: received.append(
                (workspace, user)
            )
        )

        workspace = WorkspaceService.create_workspace(user=self.user, name="Acme Corp")

        self.assertEqual(len(received), 1)
        self.assertEqual(received[0][0], workspace)
        self.assertEqual(received[0][1], self.user)

    def test_create_workspace_raises_when_limit_reached(self):
        WorkspaceService.create_workspace(user=self.user, name="Acme Corp")

        with self.assertRaises(WorkspaceLimitReachedError):
            WorkspaceService.create_workspace(user=self.user, name="Another One")
