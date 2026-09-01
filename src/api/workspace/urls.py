from django.urls import path

from workspace.views.team_list_create_view import TeamListCreateView
from workspace.views.team_member_list_view import TeamMemberListView
from workspace.views.workspace_detail_view import WorkspaceDetailView
from workspace.views.workspace_invitation_accept_view import (
    WorkspaceInvitationAcceptView,
)
from workspace.views.workspace_invitation_detail_view import (
    WorkspaceInvitationDetailView,
)
from workspace.views.workspace_invitation_list_create_view import (
    WorkspaceInvitationListCreateView,
)
from workspace.views.workspace_invitation_peek_view import WorkspaceInvitationPeekView
from workspace.views.workspace_member_list_view import WorkspaceMemberListView
from workspace.views.workspace_view import WorkspaceView

urlpatterns = [
    path("", WorkspaceView.as_view(), name="workspace-view"),
    path("<slug:slug>/", WorkspaceDetailView.as_view(), name="workspace-detail"),
    path(
        "<slug:slug>/teams/",
        TeamListCreateView.as_view(),
        name="team-list-create",
    ),
    path(
        "<slug:slug>/teams/<slug:team_slug>/members/",
        TeamMemberListView.as_view(),
        name="team-member-list",
    ),
    path(
        "<slug:slug>/members/",
        WorkspaceMemberListView.as_view(),
        name="workspace-member-list",
    ),
    path(
        "<slug:slug>/invitations/",
        WorkspaceInvitationListCreateView.as_view(),
        name="workspace-invitation-list-create",
    ),
    path(
        "<slug:slug>/invitations/<int:invitation_id>/",
        WorkspaceInvitationDetailView.as_view(),
        name="workspace-invitation-detail",
    ),
    path(
        "invitations/<str:token>/",
        WorkspaceInvitationPeekView.as_view(),
        name="workspace-invitation-peek",
    ),
    path(
        "invitations/<str:token>/accept/",
        WorkspaceInvitationAcceptView.as_view(),
        name="workspace-invitation-accept",
    ),
]
