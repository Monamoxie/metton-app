import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AuthenticatedLayout from "./AuthenticatedLayout";
import * as WorkspaceService from "@/services/workspace-service";
import * as TeamService from "@/services/team-service";

vi.mock("@/services/workspace-service");
vi.mock("@/services/team-service");
vi.mock("@/components/dashboard/TopBar", () => ({
  default: () => <div>TopBar</div>,
}));
vi.mock("@/components/dashboard/Sidebar", () => ({
  default: () => <div>Sidebar</div>,
}));

const replace = vi.fn();
let pathname = "/identity/user/availability";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => pathname,
}));

const workspace = { id: 1, slug: "acme-corp", name: "Acme Corp" };

describe("AuthenticatedLayout", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    pathname = "/identity/user/availability";
    vi.mocked(WorkspaceService.listWorkspaces).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: { workspaces: [workspace] },
    } as any);
  });

  it("redirects to /onboarding/team when the workspace has no team at all", async () => {
    vi.mocked(TeamService.listTeams).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: { teams: [] },
    } as any);

    render(<AuthenticatedLayout>content</AuthenticatedLayout>);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/onboarding/team");
    });
  });

  it("does NOT redirect when only the auto-created default team exists", async () => {
    vi.mocked(TeamService.listTeams).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: { teams: [{ id: 1, slug: "general", is_default: true }] },
    } as any);

    render(<AuthenticatedLayout>content</AuthenticatedLayout>);

    await screen.findByText("content");
    expect(replace).not.toHaveBeenCalled();
  });

  it("does NOT redirect when a manually created team exists", async () => {
    vi.mocked(TeamService.listTeams).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: { teams: [{ id: 2, slug: "engineering", is_default: false }] },
    } as any);

    render(<AuthenticatedLayout>content</AuthenticatedLayout>);

    await screen.findByText("content");
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects to /workspace when the user has no workspace at all", async () => {
    vi.mocked(WorkspaceService.listWorkspaces).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: { workspaces: [] },
    } as any);

    render(<AuthenticatedLayout>content</AuthenticatedLayout>);

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/workspace");
    });
    expect(TeamService.listTeams).not.toHaveBeenCalled();
  });

  it("skips both checks entirely while already on /workspace or /onboarding", async () => {
    pathname = "/workspace/acme-corp";

    render(<AuthenticatedLayout>content</AuthenticatedLayout>);

    await screen.findByText("content");
    expect(WorkspaceService.listWorkspaces).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });
});
