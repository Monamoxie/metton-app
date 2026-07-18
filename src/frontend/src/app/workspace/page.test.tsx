import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import WorkspaceLandingPage from "./page";
import * as WorkspaceService from "@/services/workspace-service";

vi.mock("@/services/workspace-service");

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));

describe("WorkspaceLandingPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("shows the create-workspace prompt when the user has no workspaces", async () => {
    vi.mocked(WorkspaceService.listWorkspaces).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: { workspaces: [] },
    } as any);

    render(<WorkspaceLandingPage />);

    expect(
      await screen.findByText(/don.t have any workspaces yet/i)
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects to the workspace when the user has exactly one", async () => {
    vi.mocked(WorkspaceService.listWorkspaces).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: {
        workspaces: [{ id: 1, slug: "acme-corp", name: "Acme Corp" }],
      },
    } as any);

    render(<WorkspaceLandingPage />);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/workspace/acme-corp");
    });
  });

  it("lets the user pick when they belong to multiple workspaces", async () => {
    vi.mocked(WorkspaceService.listWorkspaces).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: {
        workspaces: [
          { id: 1, slug: "acme-corp", name: "Acme Corp" },
          { id: 2, slug: "side-project", name: "Side Project" },
        ],
      },
    } as any);

    render(<WorkspaceLandingPage />);

    expect(await screen.findByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Side Project")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
