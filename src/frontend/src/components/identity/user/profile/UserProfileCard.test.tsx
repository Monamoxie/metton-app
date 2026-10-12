import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ProfileCard from "./UserProfileCard";
import * as UserService from "@/services/user-service";

vi.mock("@/services/user-service");
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock("./UserProfileForm", () => ({
  default: () => <div>UserProfileForm</div>,
}));

const user = {
  public_id: "abc123",
  email: "alex@example.com",
  name: "Alex Morgan",
  is_active: true,
  position: "Consultant",
  company: null,
  profile_summary: null,
  profile_photo: null,
  date_joined: new Date(),
  email_verified: true,
};

const originalEnv = process.env.NEXT_PUBLIC_TEMP_APP_URL;

describe("UserProfileCard — booking link", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.NEXT_PUBLIC_TEMP_APP_URL = "http://localhost:8080";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_TEMP_APP_URL = originalEnv;
  });

  it("shows the user's booking link built from their public_id", async () => {
    vi.mocked(UserService.getProfile).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: user,
    } as any);

    render(<ProfileCard />);

    const input = (await screen.findByDisplayValue(
      "http://localhost:8080/meet/abc123"
    )) as HTMLInputElement;
    expect(input).toHaveAttribute("readonly");
  });

  it("copies the booking link to the clipboard when the copy button is clicked", async () => {
    vi.mocked(UserService.getProfile).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: user,
    } as any);
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(<ProfileCard />);
    await screen.findByDisplayValue("http://localhost:8080/meet/abc123");

    fireEvent.click(screen.getByRole("button", { name: /copy booking link/i }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("http://localhost:8080/meet/abc123")
    );
  });

  it("does not render the booking link section when the base URL isn't configured", async () => {
    process.env.NEXT_PUBLIC_TEMP_APP_URL = "";
    vi.mocked(UserService.getProfile).mockResolvedValue({
      code: 200,
      message: "",
      errors: null,
      data: user,
    } as any);

    render(<ProfileCard />);

    await waitFor(() => expect(UserService.getProfile).toHaveBeenCalled());
    expect(screen.queryByText(/your booking link/i)).not.toBeInTheDocument();
  });
});
