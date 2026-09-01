import hashlib
import secrets
from datetime import timedelta
from typing import Union

from django.db import transaction
from django.db.models import QuerySet
from django.utils import timezone

from identity.models.user import User
from workspace.enums import TeamMembershipRoleName, WorkspaceInvitationStatus
from workspace.exceptions import (
    AlreadyWorkspaceMemberError,
    InvitationAlreadyAcceptedError,
    InvitationEmailMismatchError,
    InvitationExpiredError,
    InvitationNotFoundError,
)
from workspace.models import Team, Workspace, WorkspaceInvitation
from workspace.services.team_membership_service import TeamMembershipService
from workspace.services.workspace_membership_service import WorkspaceMembershipService


class WorkspaceInvitationService:
    # How long an invitation stays valid before the invitee must be re-invited.
    EXPIRY = timedelta(days=7)

    @classmethod
    def create_invitations(
        cls,
        workspace: Workspace,
        invites: list[dict],
        invited_by: User,
        team: Union[Team, None] = None,
    ) -> list[WorkspaceInvitation]:
        created = []
        with transaction.atomic():
            for invite in invites:
                email = invite["email"]
                role = invite["role"]

                if WorkspaceMembershipService.get_workspace_membership_by_email(
                    workspace, email
                ):
                    raise AlreadyWorkspaceMemberError(email)

                # Re-inviting the same email refreshes the token/expiry rather than
                # stacking duplicate pending invitations.
                WorkspaceInvitation.objects.filter(
                    workspace=workspace,
                    email=email,
                    status=WorkspaceInvitationStatus.PENDING.value,
                ).delete()

                plain_token = secrets.token_urlsafe(32)
                invitation = WorkspaceInvitation.objects.create(
                    workspace=workspace,
                    team=team,
                    email=email,
                    role=role,
                    invited_by=invited_by,
                    token=cls._hash_token(plain_token),
                    expires_at=timezone.now() + cls.EXPIRY,
                )
                # Stash the plaintext token on the instance (not persisted) so the
                # caller can build the invite link without a second lookup.
                invitation.plain_token = plain_token
                created.append(invitation)

        return created

    @staticmethod
    def peek(token: str) -> WorkspaceInvitation:
        return WorkspaceInvitationService._get_valid_invitation(token)

    @classmethod
    def accept(cls, token: str, user: User) -> WorkspaceInvitation:
        invitation = cls._get_valid_invitation(token)

        if invitation.status == WorkspaceInvitationStatus.ACCEPTED.value:
            raise InvitationAlreadyAcceptedError()

        if invitation.email.lower() != user.email.lower():
            raise InvitationEmailMismatchError()

        with transaction.atomic():
            if not WorkspaceMembershipService.is_member(invitation.workspace, user):
                WorkspaceMembershipService.add_member(
                    workspace=invitation.workspace,
                    user=user,
                    role_name=invitation.role,
                    invited_by=invitation.invited_by,
                )

            team = invitation.team or cls._default_team(invitation.workspace)
            if team and not TeamMembershipService.is_member(team, user):
                TeamMembershipService.add_member(
                    team=team, user=user, role=TeamMembershipRoleName.MEMBER.value
                )

            invitation.status = WorkspaceInvitationStatus.ACCEPTED.value
            invitation.accepted_at = timezone.now()
            invitation.save(update_fields=["status", "accepted_at"])

        return invitation

    @staticmethod
    def list_pending_for_workspace(workspace: Workspace) -> QuerySet:
        return WorkspaceInvitation.objects.filter(
            workspace=workspace, status=WorkspaceInvitationStatus.PENDING.value
        )

    @staticmethod
    def revoke(workspace: Workspace, invitation_id: int) -> None:
        deleted, _ = WorkspaceInvitation.objects.filter(
            id=invitation_id,
            workspace=workspace,
            status=WorkspaceInvitationStatus.PENDING.value,
        ).delete()

        if not deleted:
            raise InvitationNotFoundError()

    @staticmethod
    def _default_team(workspace: Workspace) -> Union[Team, None]:
        return Team.objects.filter(workspace=workspace, is_default=True).first()

    @staticmethod
    def _get_valid_invitation(token: str) -> WorkspaceInvitation:
        hashed_token = WorkspaceInvitationService._hash_token(token)

        invitation = WorkspaceInvitation.objects.select_related(
            "workspace", "team"
        ).filter(token=hashed_token).first()

        if not invitation:
            raise InvitationNotFoundError()

        if timezone.now() > invitation.expires_at:
            raise InvitationExpiredError()

        return invitation

    @staticmethod
    def _hash_token(token: str) -> str:
        return hashlib.sha256(token.encode()).hexdigest()
