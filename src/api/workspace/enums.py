from enum import Enum


class WorkspaceRoleName(Enum):
    OWNER = "Owner"
    ADMIN = "Admin"
    MANAGER = "Manager"
    MEMBER = "Member"
    VIEWER = "Viewer"

    @classmethod
    def options(cls):
        return [(key.value, key.value.title()) for key in cls]

    @classmethod
    def assignable(cls):
        """Roles that can be granted via invite or role-change — everything but Owner."""
        return {cls.ADMIN.value, cls.MANAGER.value, cls.MEMBER.value, cls.VIEWER.value}


class TeamMembershipRoleName(Enum):
    LEAD = "lead"
    MEMBER = "member"


class WorkspaceInvitationStatus(Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"

    @classmethod
    def options(cls):
        return [(key.value, key.value.title()) for key in cls]
