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
