export type WorkspaceRole = "owner" | "admin" | "member";
export type InviteStatus = "pending" | "active";

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: WorkspaceRole;
  status: InviteStatus;
  teamId: string | null;
  teamName: string | null;
  joinedAt: string | null;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  memberCount: number;
  members: WorkspaceMember[];
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  memberCount: number;
  teamCount: number;
  createdBy: string;
  createdAt: string;
}

export interface WorkspaceSummary {
  id: number;
  name: string;
  slug: string;
  timezone: string;
  description: string | null;
  photo: string | null;
  banner: string | null;
  created_at: string;
}

export interface CreateWorkspaceInput {
  name: string;
  timezone?: string;
}

export interface TeamSummary {
  id: number;
  name: string;
  slug: string;
  is_default: boolean;
  created_at: string;
}

export interface TeamMemberUser {
  public_id: string;
  email: string;
  name: string;
}

export interface TeamMembershipSummary {
  user: TeamMemberUser;
  role: "lead" | "member";
  created_at: string;
}
