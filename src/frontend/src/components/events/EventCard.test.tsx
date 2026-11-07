import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import EventCard, { calendarRangeParams, toCalendarEvents } from "./EventCard";
import * as EventService from "@/services/event-service";
import { CalendarBooking } from "@/types/event";

vi.mock("@/services/event-service", async (importOriginal) => {
  const actual = await importOriginal<typeof EventService>();
  return { ...actual, getCalendar: vi.fn() };
});

const booking: CalendarBooking = {
  id: "b1_20300108T1000",
  booking_id: "b1",
  title: "Intro call",
  start: new Date().toISOString(),
  end: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  attendees: ["guest@example.com"],
  note: "",
  timezone: "UTC",
  is_recurring: false,
};

const okResponse = (data: object) =>
  ({ code: 200, message: "", errors: null, data }) as any;

describe("calendarRangeParams", () => {
  it("turns FullCalendar's exclusive end into an inclusive date", () => {
    expect(
      calendarRangeParams({
        start: new Date(2030, 0, 6),
        end: new Date(2030, 0, 13),
      })
    ).toEqual({ start: "2030-01-06", end: "2030-01-12" });
  });
});

describe("toCalendarEvents", () => {
  it("keeps the booking details on each calendar event", () => {
    const [event] = toCalendarEvents([booking]);

    expect(event.id).toBe("b1_20300108T1000");
    expect(event.title).toBe("Intro call");
    expect(event.start).toBe(booking.start);
    expect(event.extendedProps).toMatchObject({
      bookingId: "b1",
      attendees: ["guest@example.com"],
    });
  });

  it("falls back to the guest's email when a booking has no title", () => {
    const [event] = toCalendarEvents([{ ...booking, title: "" }]);

    expect(event.title).toBe("guest@example.com");
  });
});

describe("EventCard", () => {
  beforeEach(() => {
    vi.mocked(EventService.getCalendar).mockReset();
  });

  it("loads the visible range and shows the bookings", async () => {
    vi.mocked(EventService.getCalendar).mockResolvedValue(
      okResponse({ bookings: [booking], unavailable: [] })
    );

    render(<EventCard />);

    await waitFor(() => expect(EventService.getCalendar).toHaveBeenCalled());
    const [start, end] = vi.mocked(EventService.getCalendar).mock.calls[0];
    expect(start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(end >= start).toBe(true);
    expect((await screen.findAllByText("Intro call")).length).toBeGreaterThan(0);
  });

  it("no longer shows the hardcoded sample events", async () => {
    vi.mocked(EventService.getCalendar).mockResolvedValue(
      okResponse({ bookings: [], unavailable: [] })
    );

    render(<EventCard />);

    await waitFor(() => expect(EventService.getCalendar).toHaveBeenCalled());
    expect(screen.queryByText("Design onboarding")).not.toBeInTheDocument();
  });

  it("shows an error when the calendar can't be loaded", async () => {
    vi.mocked(EventService.getCalendar).mockResolvedValue({
      code: 500,
      message: "An error occurred while processing your request",
      errors: null,
      data: null,
    } as any);

    render(<EventCard />);

    expect(
      await screen.findByText("An error occurred while processing your request")
    ).toBeInTheDocument();
  });
});
