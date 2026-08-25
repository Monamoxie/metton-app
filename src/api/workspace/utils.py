import os

from core import settings
from dashboard.tasks import email_sender
from workspace.models import WorkspaceInvitation


def send_workspace_invite_email(invitation: WorkspaceInvitation, plain_token: str) -> bool:
    """Trigger a workspace-invite email via Celery/RabbitMQ"""
    invite_link = f"{settings.FRONTEND_BASE_URL}/invitations/accept/{plain_token}"
    role_article = "n" if invitation.role[0] in "AEIOU" else ""

    context = {
        "workspace_name": invitation.workspace.name,
        "inviter_name": invitation.invited_by.name or invitation.invited_by.email
        if invitation.invited_by
        else "Someone",
        "role": invitation.role,
        "role_article": role_article,
        "invite_link": invite_link,
        "expires_at": invitation.expires_at,
    }

    template = os.path.join(
        settings.BASE_DIR,
        "workspace/templates/workspace/emails/workspace_invite.email.html",
    )
    try:
        email_sender.delay(
            f"You've been invited to join {invitation.workspace.name}",
            [invitation.email],
            template,
            context,
        )
    except Exception:
        # log exception
        return False

    return True
