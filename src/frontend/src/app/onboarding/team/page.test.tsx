import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OnboardingTeamPage from "./page";
import * as WorkspaceService from "@/services/workspace-service";
import * as TeamService from "@/services/team-service";

vi.mock("@/services/workspace-service");
vi.mock("@/services/team-service");

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));

const mockWorkspace = { id: 1, slug: "acme-corp", name: "Acme Corp" };

describe("OnboardingTeamPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(WorkspaceService.listWorkspaces).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: { workspaces: [mockWorkspace] },
    } as any);
  });

  it("renders the team name field with correct placeholder and helper text", async () => {
    vi.mocked(TeamService.listTeams).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: { teams: [{ id: 1, name: "General", slug: "general", is_default: true }] },
    } as any);

    render(<OnboardingTeamPage />);

    expect(await screen.findByPlaceholderText("My Team")).toBeInTheDocument();
    expect(
      screen.getByText(/create more teams and add members from your dashboard/i)
    ).toBeInTheDocument();
  });

  it("submitting a valid name calls createTeam with the trimmed name and redirects to /dashboard", async () => {
    vi.mocked(TeamService.listTeams).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: { teams: [{ id: 1, name: "General", slug: "general", is_default: true }] },
    } as any);
    vi.mocked(TeamService.createTeam).mockResolvedValue({
      code: 201,
      message: "",
      errors: null,
      data: { team: { id: 2, name: "Engineering", slug: "engineering", is_default: false } },
    } as any);

    const user = userEvent.setup();
    render(<OnboardingTeamPage />);

    const input = await screen.findByPlaceholderText("My Team");
    await user.type(input, "  Engineering  ");
    await user.click(screen.getByRole("button", { name: /create team/i }));

    await waitFor(() => {
      expect(TeamService.createTeam).toHaveBeenCalledWith(
        "acme-corp",
        "Engineering"
      );
      expect(replace).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("Skip for now redirects to /dashboard without calling createTeam", async () => {
    vi.mocked(TeamService.listTeams).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: { teams: [{ id: 1, name: "General", slug: "general", is_default: true }] },
    } as any);

    const user = userEvent.setup();
    render(<OnboardingTeamPage />);

    await user.click(
      await screen.findByRole("button", { name: /skip for now/i })
    );

    expect(replace).toHaveBeenCalledWith("/dashboard");
    expect(TeamService.createTeam).not.toHaveBeenCalled();
  });

  it("shows inline validation for a too-short name before submission", async () => {
    vi.mocked(TeamService.listTeams).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: { teams: [{ id: 1, name: "General", slug: "general", is_default: true }] },
    } as any);

    const user = userEvent.setup();
    render(<OnboardingTeamPage />);

    const input = await screen.findByPlaceholderText("My Team");
    await user.type(input, "A");

    expect(
      screen.getByText(/team name must be at least 2 characters/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create team/i })).toBeDisabled();
  });

  it("redirects to /dashboard without rendering the form when a manual team already exists", async () => {
    vi.mocked(TeamService.listTeams).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: {
        teams: [
          { id: 1, name: "General", slug: "general", is_default: true },
          { id: 2, name: "Engineering", slug: "engineering", is_default: false },
        ],
      },
    } as any);

    render(<OnboardingTeamPage />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/dashboard");
    });
    expect(screen.queryByPlaceholderText("My Team")).not.toBeInTheDocument();
  });
});
