import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import TeamDetailPage from "./page";
import * as TeamService from "@/services/team-service";

vi.mock("@/services/team-service");

vi.mock("next/navigation", () => ({
  useParams: () => ({ slug: "acme-corp", teamSlug: "engineering" }),
}));

const teamsResponse = {
  code: 200,
  message: "",
  errors: null,
  data: {
    teams: [
      { id: 1, name: "General", slug: "general", is_default: true, created_at: "" },
      { id: 2, name: "Engineering", slug: "engineering", is_default: false, created_at: "" },
    ],
  },
};

describe("TeamDetailPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders the team and its members from the real API", async () => {
    vi.mocked(TeamService.listTeams).mockResolvedValue(teamsResponse as any);
    vi.mocked(TeamService.getTeamMembers).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: {
        members: [
          {
            user: { public_id: "u1", email: "lead@acme.com", name: "Team Lead" },
            role: "lead",
            created_at: "",
          },
        ],
      },
    } as any);

    render(<TeamDetailPage />);

    expect(await screen.findByText("Engineering")).toBeInTheDocument();
    expect(await screen.findByText("Team Lead")).toBeInTheDocument();
    expect(screen.getByText("lead@acme.com")).toBeInTheDocument();
  });

  it("shows 'Team not found' for an unknown team slug", async () => {
    vi.mocked(TeamService.listTeams).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: { teams: [] },
    } as any);

    render(<TeamDetailPage />);

    expect(await screen.findByText(/team not found/i)).toBeInTheDocument();
    expect(TeamService.getTeamMembers).not.toHaveBeenCalled();
  });
});
