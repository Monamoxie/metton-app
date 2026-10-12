import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";
import * as Cookie from "@/data/cookie";

vi.mock("@/data/cookie", () => ({ verifyToken: vi.fn() }));

const request = (path: string) => new NextRequest(new URL(`http://localhost:3000${path}`));

describe("middleware", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("redirects a logged-out visitor away from a protected route", async () => {
    vi.mocked(Cookie.verifyToken).mockResolvedValue(false);

    const response = await middleware(request("/dashboard"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/identity/signin");
  });

  it("does not redirect a logged-in visitor away from a protected route", async () => {
    vi.mocked(Cookie.verifyToken).mockResolvedValue(true);

    const response = await middleware(request("/dashboard"));

    expect(response.headers.get("location")).toBeNull();
  });

  it("bounces a logged-in visitor away from an unprotected route to /workspace", async () => {
    vi.mocked(Cookie.verifyToken).mockResolvedValue(true);

    const response = await middleware(request("/some-public-page"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/workspace");
  });

  it.each(["/meet/abc123", "/invitations/accept/xyz"])(
    "does not bounce a logged-in visitor away from the neutral route %s",
    async (path) => {
      vi.mocked(Cookie.verifyToken).mockResolvedValue(true);

      const response = await middleware(request(path));

      expect(response.headers.get("location")).toBeNull();
    }
  );

  it.each(["/meet/abc123", "/invitations/accept/xyz"])(
    "does not redirect a logged-out visitor away from the neutral route %s",
    async (path) => {
      vi.mocked(Cookie.verifyToken).mockResolvedValue(false);

      const response = await middleware(request(path));

      expect(response.headers.get("location")).toBeNull();
    }
  );
});
