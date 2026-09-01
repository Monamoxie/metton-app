import {
  InvitationSummary,
  InviteStatus,
  WorkspaceMember,
  WorkspaceMembershipSummary,
  WorkspaceRole,
} from "@/types/workspace";

export function mapToWorkspaceMembers(
  members: WorkspaceMembershipSummary[],
  invitations: InvitationSummary[]
): WorkspaceMember[] {
  const active: WorkspaceMember[] = members.map((m) => ({
    id: m.user.public_id,
    name: m.user.name,
    email: m.user.email,
    avatar: "",
    role: m.role.toLowerCase() as WorkspaceRole,
    status: "active" as InviteStatus,
    teamId: null,
    teamName: null,
    joinedAt: m.created_at,
  }));

  const pending: WorkspaceMember[] = invitations.map((i) => ({
    id: `invite-${i.email}`,
    name: "",
    email: i.email,
    avatar: "",
    role: i.role.toLowerCase() as WorkspaceRole,
    status: "pending" as InviteStatus,
    teamId: null,
    teamName: i.team || null,
    joinedAt: null,
    invitationId: i.id,
  }));

  return [...active, ...pending];
}
