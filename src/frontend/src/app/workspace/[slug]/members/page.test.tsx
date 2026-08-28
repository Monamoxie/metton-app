import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import WorkspaceMembersPage from "./page";
import * as WorkspaceService from "@/services/workspace-service";
import * as TeamService from "@/services/team-service";
import * as InvitationService from "@/services/invitation-service";

vi.mock("@/services/workspace-service");
vi.mock("@/services/team-service");
vi.mock("@/services/invitation-service");
vi.mock("next/navigation", () => ({
  useParams: () => ({ slug: "acme-corp" }),
}));

describe("WorkspaceMembersPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(TeamService.listTeams).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: { teams: [] },
    } as any);
  });

  it("renders active members and pending invitations from the real API", async () => {
    vi.mocked(WorkspaceService.listWorkspaceMembers).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: {
        members: [
          {
            user: { public_id: "u1", email: "owner@example.com", name: "Owner Person" },
            role: "Owner",
            created_at: "2026-01-01T00:00:00Z",
          },
        ],
      },
    } as any);
    vi.mocked(InvitationService.listPendingInvitations).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: {
        invitations: [
          {
            email: "invitee@example.com",
            role: "Member",
            team: null,
            status: "pending",
            expires_at: "2026-02-01T00:00:00Z",
            created_at: "2026-01-15T00:00:00Z",
          },
        ],
      },
    } as any);

    render(<WorkspaceMembersPage />);

    expect(await screen.findByText("Owner Person")).toBeInTheDocument();
    expect(screen.getByText("invitee@example.com")).toBeInTheDocument();
    expect(screen.getByText("1 active")).toBeInTheDocument();
    expect(screen.getByText("1 pending")).toBeInTheDocument();
  });

  it("shows the empty state when there are no members", async () => {
    vi.mocked(WorkspaceService.listWorkspaceMembers).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: { members: [] },
    } as any);
    vi.mocked(InvitationService.listPendingInvitations).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: { invitations: [] },
    } as any);

    render(<WorkspaceMembersPage />);

    expect(
      await screen.findByText(/no members found matching your filters/i)
    ).toBeInTheDocument();
  });
});
