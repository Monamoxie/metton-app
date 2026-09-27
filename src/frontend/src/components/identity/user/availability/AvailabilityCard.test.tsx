import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AvailabilityCard from "./AvailabilityCard";
import * as ScheduleService from "@/services/schedule-service";

vi.mock("@/services/schedule-service");

const scheduleResponse = {
  code: 200,
  message: "OK",
  errors: null,
  data: {
    schedule: {
      id: 1,
      name: "Working Hours",
      timezone: "UTC",
      is_default: true,
      weekly_hours: [
        { day_of_week: 1, start_time: "09:00:00", end_time: "17:00:00" },
      ],
      overrides: [
        { date: "2026-12-25", is_unavailable: true, start_time: null, end_time: null },
      ],
      booking_rules: {
        min_notice_minutes: 120,
        max_booking_days: 60,
        buffer_before_minutes: 0,
        buffer_after_minutes: 0,
        daily_booking_limit: null,
        allow_multiple_per_slot: false,
      },
      created_at: "",
      updated_at: "",
    },
  },
};

describe("AvailabilityCard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders existing weekly hours and overrides after fetching", async () => {
    vi.mocked(ScheduleService.getSchedule).mockResolvedValue(scheduleResponse as any);

    render(<AvailabilityCard />);

    expect(await screen.findByText("Monday")).toBeInTheDocument();
    expect(screen.getByText(/2026-12-25 — Unavailable/)).toBeInTheDocument();
  });

  it("treats a 404 (no schedule yet) as an empty state, not an error", async () => {
    vi.mocked(ScheduleService.getSchedule).mockResolvedValue({
      code: 404,
      message: "Schedule not found",
      errors: null,
      data: null,
    } as any);

    render(<AvailabilityCard />);

    await screen.findByText("Sunday");
    expect(screen.queryByText(/schedule not found/i)).not.toBeInTheDocument();
  });

  it("shows a fetch error for a non-404 failure", async () => {
    vi.mocked(ScheduleService.getSchedule).mockResolvedValue({
      code: 500,
      message: "Something went wrong",
      errors: null,
      data: null,
    } as any);

    render(<AvailabilityCard />);

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  });

  it("toggling an unconfigured day on shows a default time range", async () => {
    vi.mocked(ScheduleService.getSchedule).mockResolvedValue(scheduleResponse as any);

    render(<AvailabilityCard />);
    await screen.findByText("Monday");

    const user = userEvent.setup();
    const tuesdaySwitch = screen.getByRole("switch", { name: "Tuesday" });
    await user.click(tuesdaySwitch);

    expect(screen.getAllByText("to").length).toBeGreaterThan(0);
  });

  it("Save changes sends the currently configured weekly hours and booking rules", async () => {
    vi.mocked(ScheduleService.getSchedule).mockResolvedValue(scheduleResponse as any);
    vi.mocked(ScheduleService.updateSchedule).mockResolvedValue({
      code: 200,
      message: "Updated",
      errors: null,
      data: null,
    } as any);

    render(<AvailabilityCard />);
    await screen.findByText("Monday");

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(ScheduleService.updateSchedule).toHaveBeenCalledWith({
        weekly_hours: [{ day_of_week: 1, start_time: "09:00:00", end_time: "17:00:00" }],
        booking_rules: scheduleResponse.data.schedule.booking_rules,
      });
    });
  });

  it("shows an inline error when saving fails", async () => {
    vi.mocked(ScheduleService.getSchedule).mockResolvedValue(scheduleResponse as any);
    vi.mocked(ScheduleService.updateSchedule).mockResolvedValue({
      code: 422,
      message: "weekly_hours is invalid",
      errors: {},
      data: null,
    } as any);

    render(<AvailabilityCard />);
    await screen.findByText("Monday");

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByText(/weekly_hours is invalid/i)).toBeInTheDocument();
  });

  it("removes an override when its delete button is clicked", async () => {
    vi.mocked(ScheduleService.getSchedule).mockResolvedValue(scheduleResponse as any);
    vi.mocked(ScheduleService.removeOverride).mockResolvedValue({
      code: 200,
      message: "Deleted",
      errors: null,
      data: null,
    } as any);

    render(<AvailabilityCard />);
    await screen.findByText(/2026-12-25/);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /remove override/i }));

    await waitFor(() => {
      expect(ScheduleService.removeOverride).toHaveBeenCalledWith("2026-12-25");
    });
    await waitFor(() => {
      expect(screen.queryByText(/2026-12-25/)).not.toBeInTheDocument();
    });
  });

  it("disables Add override until a date is chosen", async () => {
    vi.mocked(ScheduleService.getSchedule).mockResolvedValue(scheduleResponse as any);

    render(<AvailabilityCard />);
    await screen.findByText("Monday");

    expect(screen.getByRole("button", { name: /add override/i })).toBeDisabled();
  });
});
