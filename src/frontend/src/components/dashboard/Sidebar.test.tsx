import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Sidebar from "./Sidebar";

let pathname = "/dashboard";
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Sidebar", () => {
  it("renders every section label when expanded", () => {
    render(<Sidebar mobileOpen={false} handleDrawerToggle={vi.fn()} />);

    // "Settings" is both a section label and its own sole item's label, so check it separately.
    ["Main", "Scheduling", "Workspace", "Growth", "Developer"].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
    expect(screen.getAllByText("Settings").length).toBeGreaterThanOrEqual(2);
  });

  it("renders a real route as a link with the correct href", () => {
    render(<Sidebar mobileOpen={false} handleDrawerToggle={vi.fn()} />);

    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");

    const availabilityLink = screen.getByRole("link", { name: /availability/i });
    expect(availabilityLink).toHaveAttribute("href", "/identity/user/availability");
  });

  it("marks the item matching the current path as active", () => {
    pathname = "/identity/user/availability";
    render(<Sidebar mobileOpen={false} handleDrawerToggle={vi.fn()} />);

    const availabilityLink = screen.getByRole("link", { name: /availability/i });
    expect(availabilityLink).toHaveClass("Mui-selected");

    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink).not.toHaveClass("Mui-selected");
  });

  it("marks the item active for a nested child route too", () => {
    pathname = "/workspace/acme-corp/teams";
    render(<Sidebar mobileOpen={false} handleDrawerToggle={vi.fn()} />);

    const teamLink = screen.getByRole("link", { name: /^team$/i });
    expect(teamLink).toHaveClass("Mui-selected");
  });

  it("collapsing the sidebar hides section labels", async () => {
    pathname = "/dashboard";
    render(<Sidebar mobileOpen={false} handleDrawerToggle={vi.fn()} />);

    expect(screen.getByText("Main")).toBeInTheDocument();

    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    const collapseButtons = screen.getAllByRole("button");
    await user.click(collapseButtons[0]);

    expect(screen.queryByText("Main")).not.toBeInTheDocument();
  });

  it("clicking an item closes the mobile drawer", async () => {
    const handleDrawerToggle = vi.fn();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(<Sidebar mobileOpen={true} handleDrawerToggle={handleDrawerToggle} />);

    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    const dashboardLinks = screen.getAllByRole("link", { name: /dashboard/i });
    await user.click(dashboardLinks[0]);

    expect(handleDrawerToggle).toHaveBeenCalled();
  });
});
