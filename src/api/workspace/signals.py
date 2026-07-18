import django.dispatch

# Sent after a Workspace and its owner WorkspaceMembership are committed.
# providing_args: workspace (Workspace), user (User)
workspace_created = django.dispatch.Signal()
