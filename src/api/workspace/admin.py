from django.contrib import admin
from workspace.models import (
    Team,
    TeamMembership,
    Workspace,
    WorkspaceMembership,
    WorkspaceRole,
)


@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "created_by", "created_at"]
    search_fields = ["name", "slug"]
    readonly_fields = ["slug", "created_at", "updated_at"]


@admin.register(WorkspaceRole)
class WorkspaceRoleAdmin(admin.ModelAdmin):
    list_display = ["name", "label", "is_system"]


@admin.register(WorkspaceMembership)
class WorkspaceMembershipAdmin(admin.ModelAdmin):
    list_display = ["user", "workspace", "role", "created_at"]
    list_filter = ["role"]
    search_fields = ["user__email", "workspace__slug"]


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "workspace", "is_default", "created_at"]
    search_fields = ["name", "slug", "workspace__slug"]
    readonly_fields = ["slug", "created_at", "updated_at"]


@admin.register(TeamMembership)
class TeamMembershipAdmin(admin.ModelAdmin):
    list_display = ["user", "team", "role", "created_at"]
    list_filter = ["role"]
    search_fields = ["user__email", "team__slug"]

