import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MemberDetailDrawer from "./MemberDetailDrawer";
import * as InvitationService from "@/services/invitation-service";
import * as WorkspaceService from "@/services/workspace-service";
import { WorkspaceMember } from "@/types/workspace";

vi.mock("@/services/invitation-service");
vi.mock("@/services/workspace-service");

const pendingMember: WorkspaceMember = {
  id: "invite-invitee@example.com",
  name: "",
  email: "invitee@example.com",
  role: "member",
  status: "pending",
  teamId: null,
  teamName: null,
  joinedAt: null,
  invitationId: 42,
};

describe("MemberDetailDrawer", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("shows a Revoke invitation button for a pending member", () => {
    render(
      <MemberDetailDrawer
        member={pendingMember}
        open
        onClose={vi.fn()}
        teams={[]}
        slug="acme-corp"
      />
    );

    expect(
      screen.getByRole("button", { name: /revoke invitation/i })
    ).toBeInTheDocument();
  });

  it("revokes the invitation and calls onRevoked + onClose on success", async () => {
    vi.mocked(InvitationService.revokeInvitation).mockResolvedValue({
      code: 200,
      message: "Invitation deleted successfully",
      errors: null,
      data: null,
    } as any);

    const onClose = vi.fn();
    const onRevoked = vi.fn();
    const user = userEvent.setup();
    render(
      <MemberDetailDrawer
        member={pendingMember}
        open
        onClose={onClose}
        teams={[]}
        slug="acme-corp"
        onRevoked={onRevoked}
      />
    );

    await user.click(screen.getByRole("button", { name: /revoke invitation/i }));

    await waitFor(() => {
      expect(InvitationService.revokeInvitation).toHaveBeenCalledWith("acme-corp", 42);
    });
    expect(onRevoked).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("shows an inline error and does not close on failure", async () => {
    vi.mocked(InvitationService.revokeInvitation).mockResolvedValue({
      code: 404,
      message: "Invitation not found",
      errors: null,
      data: null,
    } as any);

    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <MemberDetailDrawer
        member={pendingMember}
        open
        onClose={onClose}
        teams={[]}
        slug="acme-corp"
      />
    );

    await user.click(screen.getByRole("button", { name: /revoke invitation/i }));

    expect(await screen.findByText(/invitation not found/i)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows Remove from workspace (not Revoke) for an active member", () => {
    const activeMember: WorkspaceMember = {
      ...pendingMember,
      status: "active",
      invitationId: undefined,
    };

    render(
      <MemberDetailDrawer
        member={activeMember}
        open
        onClose={vi.fn()}
        teams={[]}
        slug="acme-corp"
      />
    );

    expect(
      screen.getByRole("button", { name: /remove from workspace/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /revoke invitation/i })
    ).not.toBeInTheDocument();
  });

  const activeMember: WorkspaceMember = {
    id: "user-1",
    name: "Jane Doe",
    email: "jane@example.com",
    role: "member",
    status: "active",
    teamId: "general",
    teamName: "General",
    joinedAt: "2026-01-01",
  };

  const teams = [
    { id: 1, name: "General", slug: "general", is_default: true, created_at: "" },
    { id: 2, name: "Engineering", slug: "engineering", is_default: false, created_at: "" },
  ];

  it("offers Manager and Viewer as role options", async () => {
    const user = userEvent.setup();
    render(
      <MemberDetailDrawer
        member={activeMember}
        open
        onClose={vi.fn()}
        teams={teams}
        slug="acme-corp"
      />
    );

    await user.click(screen.getAllByRole("combobox")[0]);

    expect(screen.getByRole("option", { name: /^manager$/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /^viewer$/i })).toBeInTheDocument();
  });

  it("lists the workspace's real teams", async () => {
    const user = userEvent.setup();
    render(
      <MemberDetailDrawer
        member={activeMember}
        open
        onClose={vi.fn()}
        teams={teams}
        slug="acme-corp"
      />
    );

    await user.click(screen.getAllByRole("combobox")[1]);

    expect(screen.getByRole("option", { name: /engineering/i })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /general.*default/i })
    ).toBeInTheDocument();
  });

  it("disables the role and team selects while the invitation is pending", () => {
    render(
      <MemberDetailDrawer
        member={pendingMember}
        open
        onClose={vi.fn()}
        teams={teams}
        slug="acme-corp"
      />
    );

    const [roleSelect, teamSelect] = screen.getAllByRole("combobox");
    expect(roleSelect).toHaveAttribute("aria-disabled", "true");
    expect(teamSelect).toHaveAttribute("aria-disabled", "true");
  });

  it("keeps the Update button disabled until something changes", async () => {
    const user = userEvent.setup();
    render(
      <MemberDetailDrawer
        member={activeMember}
        open
        onClose={vi.fn()}
        teams={teams}
        slug="acme-corp"
      />
    );

    const updateButton = screen.getByRole("button", { name: /^update$/i });
    expect(updateButton).toBeDisabled();

    await user.click(screen.getAllByRole("combobox")[0]);
    await user.click(screen.getByRole("option", { name: /^manager$/i }));

    expect(updateButton).toBeEnabled();
  });

  it("sends only the changed field and calls onMemberUpdated on success", async () => {
    vi.mocked(WorkspaceService.updateMember).mockResolvedValue({
      code: 200,
      message: "Member updated successfully",
      errors: null,
      data: null,
    } as any);

    const onMemberUpdated = vi.fn();
    const user = userEvent.setup();
    render(
      <MemberDetailDrawer
        member={activeMember}
        open
        onClose={vi.fn()}
        teams={teams}
        slug="acme-corp"
        onMemberUpdated={onMemberUpdated}
      />
    );

    await user.click(screen.getAllByRole("combobox")[0]);
    await user.click(screen.getByRole("option", { name: /^manager$/i }));
    await user.click(screen.getByRole("button", { name: /^update$/i }));

    await waitFor(() => {
      expect(WorkspaceService.updateMember).toHaveBeenCalledWith(
        "acme-corp",
        "user-1",
        { role: "manager" }
      );
    });
    expect(onMemberUpdated).toHaveBeenCalled();
  });

  it("sends both role and team together when both changed", async () => {
    vi.mocked(WorkspaceService.updateMember).mockResolvedValue({
      code: 200,
      message: "Member updated successfully",
      errors: null,
      data: null,
    } as any);

    const user = userEvent.setup();
    render(
      <MemberDetailDrawer
        member={activeMember}
        open
        onClose={vi.fn()}
        teams={teams}
        slug="acme-corp"
      />
    );

    await user.click(screen.getAllByRole("combobox")[0]);
    await user.click(screen.getByRole("option", { name: /^manager$/i }));
    await user.click(screen.getAllByRole("combobox")[1]);
    await user.click(screen.getByRole("option", { name: /engineering/i }));
    await user.click(screen.getByRole("button", { name: /^update$/i }));

    await waitFor(() => {
      expect(WorkspaceService.updateMember).toHaveBeenCalledWith(
        "acme-corp",
        "user-1",
        { role: "manager", team_slug: "engineering" }
      );
    });
  });

  it("shows an inline error and keeps the edited values on failure", async () => {
    vi.mocked(WorkspaceService.updateMember).mockResolvedValue({
      code: 403,
      message: "You do not have permission to perform this action",
      errors: null,
      data: null,
    } as any);

    const user = userEvent.setup();
    render(
      <MemberDetailDrawer
        member={activeMember}
        open
        onClose={vi.fn()}
        teams={teams}
        slug="acme-corp"
      />
    );

    await user.click(screen.getAllByRole("combobox")[0]);
    await user.click(screen.getByRole("option", { name: /^viewer$/i }));
    await user.click(screen.getByRole("button", { name: /^update$/i }));

    expect(await screen.findByText(/do not have permission/i)).toBeInTheDocument();
    expect(screen.getAllByRole("combobox")[0]).toHaveTextContent("Viewer");
  });
});
