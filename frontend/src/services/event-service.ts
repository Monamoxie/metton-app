import dayjs, { Dayjs } from "dayjs";
import { DateInput, EventInput } from "@fullcalendar/core";

export function isSlotClosed(slot: any, closedSlots: any[]) {
  if (!slot) return false;

  const slotStart = new Date(slot.startStr || slot.dateStr);
  const slotEnd = slot.endStr ? new Date(slot.endStr) : slotStart;

  return closedSlots.some((closed) => {
    const closedStart = new Date(closed.start);
    const closedEnd = closed.end ? new Date(closed.end) : closedStart;

    // Check if slot overlaps closed slot
    return slotStart < closedEnd && slotEnd > closedStart;
  });
}

export function slotHasEvent(slot: any, events: any[]) {
  if (!slot) return false;

  const slotStart = new Date(slot.startStr || slot.dateStr);
  const slotEnd = slot.endStr ? new Date(slot.endStr) : slotStart;

  return events.some((ev) => {
    const eventStart = new Date(ev.start);
    const eventEnd = ev.end ? new Date(ev.end) : eventStart;
    const overlap = slotStart < eventEnd && slotEnd > eventStart;

    return overlap;
  });
}

export const isTimeSlotBooked = (
  slot: Dayjs,
  bookings: EventInput[],
  allowMultiple: boolean
): boolean => {
  if (allowMultiple) return false; // Always allow booking
 
  return bookings.some((booking) => {
    const bookingStart = dayjs(booking.start as string);
    const bookingEnd = dayjs(booking.end as string); 

    return (
      (slot.isAfter(bookingStart) || slot.isSame(bookingStart)) &&
      slot.isBefore(bookingEnd)
    );
  });
}

type ClosedSlot = { start: string; end?: string };
type BackgroundEvent = { start: string; end?: string };

export const isDateClosedOrBlocked = (
  date: Dayjs,
  closedSlots: ClosedSlot[],
  showPast: boolean,
  showFuture: boolean
): boolean => {
  const now = dayjs();

  // Block past dates if showPast is false
  if (!showPast && date.isBefore(now, "day")) return true;

  // Block future dates if showFuture is false
  if (!showFuture && date.isAfter(now, "day")) return true;

  // Check closed slots
  for (const slot of closedSlots) {
    const slotStart = dayjs(slot.start);
    const slotEnd = slot.end ? dayjs(slot.end) : slotStart;
    if (
      date.isSame(slotStart, "day") ||
      (date.isAfter(slotStart, "day") && date.isBefore(slotEnd, "day"))
    ) {
      return true;
    }
  }

  return false;
}
