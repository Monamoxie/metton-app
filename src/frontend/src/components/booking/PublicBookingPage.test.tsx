import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import dayjs from "dayjs";
import PublicBookingPage from "./PublicBookingPage";
import * as BookingService from "@/services/booking-service";

vi.mock("@/services/booking-service");

const profileResponse = {
  code: 200,
  message: "",
  errors: null,
  data: {
    profile: {
      name: "Alex Morgan",
      company: "Acme Co",
      position: "Consultant",
      profile_summary: "Helping founders scope their MVP.",
      profile_photo: "",
    },
  },
};

const todaySlot = {
  start: dayjs().hour(14).minute(0).second(0).format("YYYY-MM-DDTHH:mm:ss[Z]"),
  end: dayjs().hour(14).minute(30).second(0).format("YYYY-MM-DDTHH:mm:ss[Z]"),
};

const slotsResponse = {
  code: 200,
  message: "",
  errors: null,
  data: { slots: [todaySlot] },
};

describe("PublicBookingPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(BookingService.getPublicProfile).mockResolvedValue(profileResponse as any);
    vi.mocked(BookingService.getAvailableSlots).mockResolvedValue(slotsResponse as any);
  });

  it("renders the host's profile once fetched", async () => {
    render(<PublicBookingPage publicId="abc123" />);

    expect(await screen.findByText("Alex Morgan")).toBeInTheDocument();
    expect(screen.getByText("Consultant at Acme Co")).toBeInTheDocument();
  });

  it("selecting an available slot reveals the confirm form", async () => {
    render(<PublicBookingPage publicId="abc123" />);
    await screen.findByText("Alex Morgan");

    const slotLabel = dayjs(todaySlot.start).format("h:mm A");
    const slotButton = await screen.findByText(slotLabel);
    fireEvent.click(slotButton);

    expect(await screen.findByText("Confirm your details")).toBeInTheDocument();
  });

  it("submitting a valid booking shows the success state", async () => {
    vi.mocked(BookingService.createBooking).mockResolvedValue({
      code: 201,
      message: "Booking created successfully",
      errors: null,
      data: { booking: { id: "1" } },
    } as any);

    render(<PublicBookingPage publicId="abc123" />);
    await screen.findByText("Alex Morgan");
    fireEvent.click(await screen.findByText(dayjs(todaySlot.start).format("h:mm A")));
    await screen.findByText("Confirm your details");

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "guest@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /confirm booking/i }));

    expect(await screen.findByText("You're booked!")).toBeInTheDocument();
    expect(BookingService.createBooking).toHaveBeenCalledWith(
      "abc123",
      expect.objectContaining({ email: "guest@example.com", repeat_type: "no" })
    );
  });

  it("a rejected booking shows the real error instead of success", async () => {
    vi.mocked(BookingService.createBooking).mockResolvedValue({
      code: 422,
      message: "This time slot is no longer available. Please choose another time.",
      errors: { non_field_errors: ["This time slot is no longer available. Please choose another time."] },
      data: null,
    } as any);

    render(<PublicBookingPage publicId="abc123" />);
    await screen.findByText("Alex Morgan");
    fireEvent.click(await screen.findByText(dayjs(todaySlot.start).format("h:mm A")));
    await screen.findByText("Confirm your details");

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "guest@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /confirm booking/i }));

    expect(
      await screen.findByText("This time slot is no longer available. Please choose another time.")
    ).toBeInTheDocument();
    expect(screen.queryByText("You're booked!")).not.toBeInTheDocument();
  });
});
