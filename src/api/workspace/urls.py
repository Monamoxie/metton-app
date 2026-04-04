from django.urls import path

from workspace.views.workspace_view import WorkspaceView

urlpatterns = [
    path("", WorkspaceView.as_view(), name="workspace-view")
]