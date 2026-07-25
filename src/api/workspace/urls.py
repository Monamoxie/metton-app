from django.urls import path

from workspace.views.team_list_create_view import TeamListCreateView
from workspace.views.team_member_list_view import TeamMemberListView
from workspace.views.workspace_detail_view import WorkspaceDetailView
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
]
