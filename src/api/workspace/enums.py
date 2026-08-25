from enum import Enum


class WorkspaceRoleName(Enum):
    OWNER = "Owner"
    ADMIN = "Admin"
    MEMBER = "Member"

    @classmethod
    def options(cls):
        return [(key.value, key.value.title()) for key in cls]


class TeamMembershipRoleName(Enum):
    LEAD = "lead"
    MEMBER = "member"


class WorkspaceInvitationStatus(Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"

    @classmethod
    def options(cls):
        return [(key.value, key.value.title()) for key in cls]
