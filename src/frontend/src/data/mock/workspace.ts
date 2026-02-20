import {
  Workspace,
  Team,
  WorkspaceMember,
} from "@/types/workspace";

// ─── Mock Members ──────────────────────────────────────────────
export const mockMembers: WorkspaceMember[] = [
  {
    id: "u1",
    name: "John Doe",
    email: "john@acme.com",
    avatar: "",
    role: "owner",
    status: "active",
    teamId: "t1",
    teamName: "General",
    joinedAt: "2025-09-01T10:00:00Z",
  },
  {
    id: "u2",
    name: "Jane Smith",
    email: "jane@acme.com",
    avatar: "",
    role: "admin",
    status: "active",
    teamId: "t2",
    teamName: "Design",
    joinedAt: "2025-10-12T08:30:00Z",
  },
  {
    id: "u3",
    name: "Bob Wilson",
    email: "bob@acme.com",
    avatar: "",
    role: "member",
    status: "active",
    teamId: "t3",
    teamName: "Engineering",
    joinedAt: "2025-11-05T14:00:00Z",
  },
  {
    id: "u4",
    name: "Sarah Lee",
    email: "sarah@acme.com",
    avatar: "",
    role: "member",
    status: "active",
    teamId: "t1",
    teamName: "General",
    joinedAt: "2026-01-08T09:15:00Z",
  },
  {
    id: "u5",
    name: "",
    email: "alice@external.com",
    avatar: "",
    role: "member",
    status: "pending",
    teamId: null,
    teamName: null,
    joinedAt: null,
  },
];

// ─── Mock Teams ────────────────────────────────────────────────
export const mockTeams: Team[] = [
  {
    id: "t1",
    name: "General",
    description: "Default team for all workspace members",
    isDefault: true,
    memberCount: 2,
    members: mockMembers.filter((m) => m.teamId === "t1"),
  },
  {
    id: "t2",
    name: "Design",
    description: "Product design and UX team",
    isDefault: false,
    memberCount: 1,
    members: mockMembers.filter((m) => m.teamId === "t2"),
  },
  {
    id: "t3",
    name: "Engineering",
    description: "Development and infrastructure",
    isDefault: false,
    memberCount: 1,
    members: mockMembers.filter((m) => m.teamId === "t3"),
  },
];

// ─── Mock Workspaces ───────────────────────────────────────────
export const mockWorkspaces: Workspace[] = [
  {
    id: "ws1",
    name: "Acme Corp",
    slug: "acme-corp",
    logo: "",
    memberCount: 5,
    teamCount: 3,
    createdBy: "u1",
    createdAt: "2025-09-01T10:00:00Z",
  },
  {
    id: "ws2",
    name: "Side Project",
    slug: "side-project",
    logo: "",
    memberCount: 2,
    teamCount: 1,
    createdBy: "u1",
    createdAt: "2026-01-15T12:00:00Z",
  },
];

// ─── Current workspace helper ──────────────────────────────────
export const currentWorkspace = mockWorkspaces[0];
