import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InviteMemberDialog from "./InviteMemberDialog";
import * as InvitationService from "@/services/invitation-service";

vi.mock("@/services/invitation-service");

const teams = [
  { id: 1, name: "General", slug: "general", is_default: true, created_at: "" },
  { id: 2, name: "Engineering", slug: "engineering", is_default: false, created_at: "" },
];

// fireEvent.change instead of userEvent.type for the email field: typing a full
// address character-by-character was flaky under load, this is instant and tests
// the same behavior (state updates on change).
const addEmail = async (email: string) => {
  fireEvent.change(screen.getByLabelText(/email address/i), {
    target: { value: email },
  });
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /^add$/i }));
};

describe("InviteMemberDialog", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("adds an email to the pending list and enables Send", async () => {
    render(
      <InviteMemberDialog open onClose={vi.fn()} slug="acme-corp" teams={teams} />
    );

    const sendButton = screen.getByRole("button", { name: /send.*invitation/i });
    expect(sendButton).toBeDisabled();

    await addEmail("colleague@example.com");

    expect(screen.getByText("colleague@example.com")).toBeInTheDocument();
    expect(sendButton).toBeEnabled();
  });

  it("sends invites with the default team and calls onInvited + onClose on success", async () => {
    vi.mocked(InvitationService.inviteMembers).mockResolvedValue({
      code: 201,
      message: "Invitations has been sent successfully",
      errors: null,
      data: { invitations: [] },
    } as any);

    const onClose = vi.fn();
    const onInvited = vi.fn();
    render(
      <InviteMemberDialog
        open
        onClose={onClose}
        onInvited={onInvited}
        slug="acme-corp"
        teams={teams}
      />
    );

    await addEmail("colleague@example.com");
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /send.*invitation/i }));

    await waitFor(() => {
      expect(InvitationService.inviteMembers).toHaveBeenCalledWith(
        "acme-corp",
        [{ email: "colleague@example.com", role: "member" }],
        "general"
      );
    });
    expect(onInvited).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("shows an inline error and does not close on failure", async () => {
    vi.mocked(InvitationService.inviteMembers).mockResolvedValue({
      code: 400,
      message: "colleague@example.com is already a member of this workspace",
      errors: {},
      data: null,
    } as any);

    const onClose = vi.fn();
    render(
      <InviteMemberDialog open onClose={onClose} slug="acme-corp" teams={teams} />
    );

    await addEmail("colleague@example.com");
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /send.*invitation/i }));

    expect(await screen.findByText(/already a member/i)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
