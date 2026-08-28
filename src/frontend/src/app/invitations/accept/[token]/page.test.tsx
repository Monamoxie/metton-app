import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import AcceptInvitationPage from "./page";
import * as InvitationService from "@/services/invitation-service";
import { authStore } from "@/stores/auth-store";

vi.mock("@/services/invitation-service");

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useParams: () => ({ token: "abc123" }),
  useRouter: () => ({ push }),
}));

const invitationPeek = {
  email: "invitee@example.com",
  role: "Member",
  workspace_name: "Acme Corp",
  workspace_slug: "acme-corp",
  expires_at: "2026-02-01T00:00:00Z",
};

describe("AcceptInvitationPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authStore.setState({ token: null, user: null, rememberMe: false });
  });

  it("prompts sign in / create account when not logged in", async () => {
    vi.mocked(InvitationService.peekInvitation).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: { invitation: invitationPeek },
    } as any);

    render(<AcceptInvitationPage />);

    expect(await screen.findByText(/join acme corp/i)).toBeInTheDocument();
    const signInLink = screen.getByRole("link", { name: /sign in/i });
    expect(signInLink).toHaveAttribute(
      "href",
      expect.stringContaining("invite_token=abc123")
    );
    const signUpLink = screen.getByRole("link", { name: /create account/i });
    expect(signUpLink).toHaveAttribute(
      "href",
      expect.stringContaining("email=invitee%40example.com")
    );
  });

  it("auto-accepts and redirects when logged in with a matching email", async () => {
    vi.mocked(InvitationService.peekInvitation).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: { invitation: invitationPeek },
    } as any);
    vi.mocked(InvitationService.acceptInvitation).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: { workspace: { slug: "acme-corp" } },
    } as any);
    authStore.setState({
      token: { token: "tok", expiry: "" } as any,
      user: { email: "invitee@example.com" } as any,
      rememberMe: false,
    });

    render(<AcceptInvitationPage />);

    await waitFor(() => {
      expect(InvitationService.acceptInvitation).toHaveBeenCalledWith("abc123");
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/workspace/acme-corp");
    });
  });

  it("shows a mismatch message when logged in with a different email", async () => {
    vi.mocked(InvitationService.peekInvitation).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: { invitation: invitationPeek },
    } as any);
    authStore.setState({
      token: { token: "tok", expiry: "" } as any,
      user: { email: "someone-else@example.com" } as any,
      rememberMe: false,
    });

    render(<AcceptInvitationPage />);

    expect(await screen.findByText(/wrong account/i)).toBeInTheDocument();
    expect(InvitationService.acceptInvitation).not.toHaveBeenCalled();
  });

  it("shows a not-found message for an unknown token", async () => {
    vi.mocked(InvitationService.peekInvitation).mockResolvedValue({
      code: 404,
      message: "",
      errors: null,
      data: null,
    } as any);

    render(<AcceptInvitationPage />);

    expect(await screen.findByText(/invitation not found/i)).toBeInTheDocument();
  });

  it("shows an expired message for an expired token", async () => {
    vi.mocked(InvitationService.peekInvitation).mockResolvedValue({
      code: 400,
      message: "",
      errors: null,
      data: null,
    } as any);

    render(<AcceptInvitationPage />);

    expect(await screen.findByText(/invitation expired/i)).toBeInTheDocument();
  });
});
