from django.urls import path

from workspace.views.workspace_detail_view import WorkspaceDetailView
from workspace.views.workspace_view import WorkspaceView

urlpatterns = [
    path("", WorkspaceView.as_view(), name="workspace-view"),
    path("<slug:slug>/", WorkspaceDetailView.as_view(), name="workspace-detail"),
]