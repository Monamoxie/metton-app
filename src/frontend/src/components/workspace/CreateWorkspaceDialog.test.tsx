import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateWorkspaceDialog from "./CreateWorkspaceDialog";
import * as WorkspaceService from "@/services/workspace-service";

vi.mock("@/services/workspace-service");

describe("CreateWorkspaceDialog", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders the workspace name field", () => {
    render(<CreateWorkspaceDialog open onClose={vi.fn()} />);

    expect(screen.getByLabelText(/workspace name/i)).toBeInTheDocument();
  });

  it("disables submit until the name is at least 2 characters", async () => {
    const user = userEvent.setup();
    render(<CreateWorkspaceDialog open onClose={vi.fn()} />);

    const submit = screen.getByRole("button", { name: /create workspace/i });
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText(/workspace name/i), "A");
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText(/workspace name/i), "cme");
    expect(submit).toBeEnabled();
  });

  it("submits the trimmed name and calls onCreated + onClose on success", async () => {
    const onClose = vi.fn();
    const onCreated = vi.fn();
    vi.mocked(WorkspaceService.createWorkspace).mockResolvedValue({
      code: 201,
      message: "Workspace created successfully",
      errors: null,
      data: { workspace: { id: 1, slug: "acme-corp", name: "Acme Corp" } },
    } as any);

    const user = userEvent.setup();
    render(<CreateWorkspaceDialog open onClose={onClose} onCreated={onCreated} />);

    await user.type(screen.getByLabelText(/workspace name/i), "  Acme Corp  ");
    await user.click(screen.getByRole("button", { name: /create workspace/i }));

    await waitFor(() => {
      expect(WorkspaceService.createWorkspace).toHaveBeenCalledWith({
        name: "Acme Corp",
      });
    });
    expect(onCreated).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "acme-corp" })
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("shows an inline error and does not close on workspace_limit_reached", async () => {
    const onClose = vi.fn();
    vi.mocked(WorkspaceService.createWorkspace).mockResolvedValue({
      code: 400,
      message: "You are only limited to 1 workspace",
      errors: {},
      data: null,
    } as any);

    const user = userEvent.setup();
    render(<CreateWorkspaceDialog open onClose={onClose} />);

    await user.type(screen.getByLabelText(/workspace name/i), "Acme Corp");
    await user.click(screen.getByRole("button", { name: /create workspace/i }));

    expect(
      await screen.findByText(/only limited to 1 workspace/i)
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
