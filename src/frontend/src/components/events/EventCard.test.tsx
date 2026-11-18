import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EventCard, { calendarRangeParams, toCalendarEvents } from "./EventCard";
import * as EventService from "@/services/event-service";
import { CalendarBooking } from "@/types/event";

vi.mock("@/services/event-service", async (importOriginal) => {
  const actual = await importOriginal<typeof EventService>();
  return {
    ...actual,
    getCalendar: vi.fn(),
    acceptBooking: vi.fn(),
    declineBooking: vi.fn(),
  };
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
  status: "confirmed",
};

const pendingBooking: CalendarBooking = {
  ...booking,
  id: "p1_20300109T1000",
  booking_id: "p1",
  title: "Pricing chat",
  attendees: ["sam@example.com"],
  note: "Would love to talk pricing",
  status: "pending",
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

  it("fetches a range once, not on every re-render", async () => {
    vi.mocked(EventService.getCalendar).mockResolvedValue(
      okResponse({ bookings: [booking], unavailable: [] })
    );

    render(<EventCard />);
    await screen.findAllByText("Intro call");
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(EventService.getCalendar).toHaveBeenCalledTimes(1);
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

describe("booking requests", () => {
  beforeEach(() => {
    vi.mocked(EventService.getCalendar).mockReset();
    vi.mocked(EventService.acceptBooking).mockReset();
    vi.mocked(EventService.declineBooking).mockReset();
  });

  const loadWith = (bookings: CalendarBooking[]) =>
    vi
      .mocked(EventService.getCalendar)
      .mockResolvedValue(okResponse({ bookings, unavailable: [] }));

  it("lists pending bookings in the requests panel, not confirmed ones", async () => {
    loadWith([booking, pendingBooking]);

    render(<EventCard />);

    const [card] = await screen.findAllByTestId("booking-request");
    expect(within(card).getByText("Pricing chat")).toBeInTheDocument();
    expect(within(card).getByText(/Would love to talk pricing/)).toBeInTheDocument();
    expect(screen.getAllByTestId("booking-request")).toHaveLength(1);
    expect(screen.getByText("1 pending")).toBeInTheDocument();
  });

  it("shows one card for a repeating request, however many occurrences", async () => {
    loadWith([
      { ...pendingBooking, id: "p1_a", is_recurring: true },
      { ...pendingBooking, id: "p1_b", is_recurring: true },
    ]);

    render(<EventCard />);

    expect(await screen.findAllByTestId("booking-request")).toHaveLength(1);
  });

  it("accepts a request and reloads the calendar", async () => {
    loadWith([pendingBooking]);
    vi.mocked(EventService.acceptBooking).mockResolvedValue(
      okResponse({ booking: {} })
    );

    render(<EventCard />);
    await userEvent.click(await screen.findByRole("button", { name: "Accept" }));

    expect(EventService.acceptBooking).toHaveBeenCalledWith("p1");
    await waitFor(() =>
      expect(EventService.getCalendar).toHaveBeenCalledTimes(2)
    );
  });

  it("declines a request", async () => {
    loadWith([pendingBooking]);
    vi.mocked(EventService.declineBooking).mockResolvedValue(
      okResponse({ booking: {} })
    );

    render(<EventCard />);
    await userEvent.click(await screen.findByRole("button", { name: "Decline" }));

    expect(EventService.declineBooking).toHaveBeenCalledWith("p1");
  });

  it("shows the server's message when a request can't be accepted", async () => {
    loadWith([pendingBooking]);
    vi.mocked(EventService.acceptBooking).mockResolvedValue({
      code: 422,
      message: "This time now clashes with another booking, so it can't be accepted.",
      errors: null,
      data: null,
    } as any);

    render(<EventCard />);
    await userEvent.click(await screen.findByRole("button", { name: "Accept" }));

    expect(
      await screen.findByText(/now clashes with another booking/)
    ).toBeInTheDocument();
    // The request is still there to decide on
    expect(screen.getAllByTestId("booking-request")).toHaveLength(1);
  });
});

describe("toCalendarEvents status", () => {
  it("carries the booking status so pending ones can be styled", () => {
    const [event] = toCalendarEvents([pendingBooking]);

    expect(event.extendedProps).toMatchObject({ status: "pending", bookingId: "p1" });
  });
});
