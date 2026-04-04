from django.contrib import admin
from workspace.models import WorkspaceRole, Workspace, WorkspaceMembership

# Register your models here.
admin.site.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "created_by", "created_at"]
    search_fields = ["name", "slug"]
    readonly_fields = ["slug", "created_at", "updated_at"]

admin.site.register(WorkspaceRole)
class WorkspaceRoleAdmin(admin.ModelAdmin):
    list_display = ["name", "label", "is_system"]

admin.site.register(WorkspaceMembership)
class WorkspaceMembershipAdmin(admin.ModelAdmin):
    list_display = ["user", "workspace", "role", "created_at"]
    list_filter  =  ["admin"]
    search_fields = ["user__email", "workspace__slug"]

