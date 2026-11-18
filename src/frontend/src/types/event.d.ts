import { EventApi } from "@fullcalendar/core";

export interface SelectedSlot {
  startStr: string;
  endStr: string;
  event: EventApi;
}

// One occurrence of a booking; repeating bookings share booking_id
export type BookingStatus = "pending" | "confirmed" | "declined";

export interface CalendarBooking {
  id: string;
  booking_id: string;
  title: string;
  start: string; // ISO datetime, UTC
  end: string;
  attendees: string[];
  note: string;
  timezone: string;
  is_recurring: boolean;
  status: BookingStatus;
}

export interface CalendarUnavailableDay {
  date: string; // "YYYY-MM-DD"
  start: string; // ISO datetime, UTC
  end: string;
}

export interface CalendarData {
  bookings: CalendarBooking[];
  unavailable: CalendarUnavailableDay[];
}
