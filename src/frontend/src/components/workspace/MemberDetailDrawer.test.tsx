import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MemberDetailDrawer from "./MemberDetailDrawer";
import * as InvitationService from "@/services/invitation-service";
import { WorkspaceMember } from "@/types/workspace";

vi.mock("@/services/invitation-service");

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
});
