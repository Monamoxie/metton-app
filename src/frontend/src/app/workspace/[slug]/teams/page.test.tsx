import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WorkspaceTeamsPage from "./page";
import * as TeamService from "@/services/team-service";

vi.mock("@/services/team-service");

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useParams: () => ({ slug: "acme-corp" }),
  useRouter: () => ({ push }),
}));

describe("WorkspaceTeamsPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders teams from the real API", async () => {
    vi.mocked(TeamService.listTeams).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: {
        teams: [
          { id: 1, name: "General", slug: "general", is_default: true, created_at: "" },
          { id: 2, name: "Engineering", slug: "engineering", is_default: false, created_at: "" },
        ],
      },
    } as any);

    render(<WorkspaceTeamsPage />);

    expect(await screen.findByText("General")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("Teams (2)")).toBeInTheDocument();
  });

  it("navigates to the team detail route by slug when a team is clicked", async () => {
    vi.mocked(TeamService.listTeams).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: {
        teams: [
          { id: 1, name: "General", slug: "general", is_default: true, created_at: "" },
        ],
      },
    } as any);

    render(<WorkspaceTeamsPage />);

    fireEvent.click(await screen.findByText("General"));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/workspace/acme-corp/teams/general");
    });
  });
});
