"use client";
import React, { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import { Alert, Box } from "@mui/material";
import dayjs from "dayjs";
import { DatesSetArg, EventInput } from "@fullcalendar/core";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import EventToolBar from "./EventToolBar";
import EventCalendar from "./EventCalendar";
import * as EventService from "@/services/event-service";
import CalendarSlotMenu from "../CalendarSlotMenu";
import EventManager from "./EventManager";
import { CalendarBooking, CalendarData, SelectedSlot } from "@/types/event";

// FullCalendar's range end is exclusive; the API takes inclusive local dates
export function calendarRangeParams(range: { start: Date; end: Date }) {
  return {
    start: dayjs(range.start).format("YYYY-MM-DD"),
    end: dayjs(range.end).subtract(1, "day").format("YYYY-MM-DD"),
  };
}

export function toCalendarEvents(bookings: CalendarBooking[]): EventInput[] {
  return bookings.map((booking) => ({
    id: booking.id,
    title: booking.title || booking.attendees[0] || "Booking",
    start: booking.start,
    end: booking.end,
    extendedProps: {
      bookingId: booking.booking_id,
      attendees: booking.attendees,
      note: booking.note,
      timezone: booking.timezone,
      isRecurring: booking.is_recurring,
    },
  }));
}

export default function EventCard() {
  const calendarRef = useRef<FullCalendar | null>(null);

  const [showPast, setShowPast] = useState(true);
  const [showFuture, setShowFuture] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [showManager, setShowManager] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSlots, setSelectedSlots] = useState<null | SelectedSlot>(null);

  const [events, setEvents] = useState<EventInput[]>([]);
  const [closedSlots, setClosedSlots] = useState<
    { start: string; end: string; reason: string }[]
  >([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Ignores responses for a range the user has already navigated away from
  const latestRangeKey = useRef("");

  const handleDatesSet = async (range: DatesSetArg) => {
    const { start, end } = calendarRangeParams(range);
    const rangeKey = `${start}_${end}`;
    latestRangeKey.current = rangeKey;

    const response = await EventService.getCalendar(start, end);
    if (latestRangeKey.current !== rangeKey) return;

    if (response.code !== 200) {
      setLoadError(response.message || "Unable to load your calendar.");
      return;
    }

    const data = response.data as CalendarData;
    setLoadError(null);
    setEvents(toCalendarEvents(data.bookings));
    setClosedSlots(
      data.unavailable.map((day) => ({
        start: day.start,
        end: day.end,
        reason: "UNAVAILABLE",
      }))
    );
  };

  const backgroundEvents = closedSlots.map((slot, idx) => ({
    id: `closed-${idx}`,
    start: slot.start,
    end: slot.end,
    display: "background",
    title: slot.reason || "UNAVAILABLE",
    color: "#f44336",
    textColor: "#fff",
    rendering: "background",
    extendedProps: { reason: slot.reason },
  }));
  const allEvents = [...events, ...backgroundEvents];

  // Handle slot click (select)
  const handleDateSelect = (selectInfo: any) => {
    setSelectedSlots(selectInfo);
    isMobile
      ? setShowManager(true)
      : setAnchorEl(selectInfo.jsEvent?.target || null);
  };

  // Handle popover action: Book
  const handleBook = () => {
    setShowManager(true);
    setAnchorEl(null);
  };

  // Handle popover action: View Details
  const handleViewDetails = () => {
    alert("Show event details here!");
    setAnchorEl(null);
  };

  const handleEventClick = (info: any) => {
    if (info.event.display === "background") {
      info.jsEvent.preventDefault();
      return;
    }

    setSelectedSlots({
      startStr: info.event.startStr,
      endStr: info.event.endStr,
      event: info.event,
    });

    isMobile ? setShowManager(true) : setAnchorEl(info.jsEvent.target);
  };

  // Handle event creation
  // const handleCreateEvent = () => {
  //   const start = props.selectedSlots?.startStr || manualStart?.toISOString();
  //   const end = props.selectedSlots?.endStr || manualEnd?.toISOString();
  //   if (!start || !end) return;

  //   setEvents([
  //     ...allEvents,
  //     {
  //       id: String(events.length + 1),
  //       title: newEventTitle || "New Event",
  //       start,
  //       end,
  //       tag: "New",
  //     },
  //   ]);
  //   setShowManager(false);
  //   setNewEventTitle("");
  //   setManualStart(null);
  //   setManualEnd(null);
  //   props.setSelectedSlots(null);
  // };

  return (
    <Box>
      <EventToolBar
        calendarRef={calendarRef}
        showPast={showPast}
        setShowPast={setShowPast}
        showFuture={showFuture}
        setShowFuture={setShowFuture}
      />

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}

      <EventCalendar
        calendarRef={calendarRef}
        isMobile={isMobile}
        events={allEvents}
        showPast={showPast}
        showFuture={showFuture}
        handleDateSelect={handleDateSelect}
        handleEventClick={handleEventClick}
        handleDatesSet={handleDatesSet}
        isSlotClosed={(slot) => EventService.isSlotClosed(slot, closedSlots)}
      />

      {/* todo::: rename to CalendarMenu ???  */}
      <CalendarSlotMenu
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        isClosed={EventService.isSlotClosed(selectedSlots, closedSlots)}
        hasEvent={EventService.slotHasEvent(selectedSlots, allEvents)}
        handleViewDetails={handleViewDetails}
        handleBook={handleBook}
      />

      <EventManager
        showManager={showManager}
        setShowManager={setShowManager}
        selectedSlots={selectedSlots as SelectedSlot}
        showPast={showPast}
        showFuture={showFuture}
        closedSlots={closedSlots}
        allEvents={allEvents}
        // handleCreateEvent={handleCreateEvent}
      />

    </Box>
  );
}
