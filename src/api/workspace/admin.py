from django.contrib import admin
from workspace.models import WorkspaceRole, Workspace, WorkspaceMembership

# Register your models here.
admin.site.register(Workspace)
admin.site.register(WorkspaceRole)
admin.site.register(WorkspaceMembership)
