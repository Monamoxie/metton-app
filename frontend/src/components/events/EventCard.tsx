"use client";
import React, { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import { Box } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import EventToolBar from "./EventToolBar";
import EventCalendar from "./EventCalendar";
import * as EventService from "@/services/event-service";
import CalendarSlotMenu from "../CalendarSlotMenu";
import EventManager from "./EventManager";
import { SelectedSlot } from "@/types/event";

const initialEvents = [
  {
    id: "1",
    title: "Design onboarding",
    start: "2025-05-29T09:30:00",
    end: "2025-05-29T10:30:00",
    tag: "Work",
  },
  // ...more events
];

export default function EventCard() {
  const calendarRef = useRef<FullCalendar | null>(null);

  const [showPast, setShowPast] = useState(true);
  const [showFuture, setShowFuture] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [showManager, setShowManager] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSlots, setSelectedSlots] = useState<null | SelectedSlot>(null);

  const closedSlots = [
    {
      start: "2025-05-23T09:00:00",
      end: "2025-05-23T10:00:00",
      reason: "UNAVAILABLE",
    },
    { start: "2025-05-23", end: "2025-05-24", reason: "Maintenance" },
    // ...more
  ];

  const [events, setEvents] = useState(initialEvents);
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

      <EventCalendar
        calendarRef={calendarRef}
        isMobile={isMobile}
        events={allEvents}
        showPast={showPast}
        showFuture={showFuture}
        handleDateSelect={handleDateSelect}
        handleEventClick={handleEventClick}
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
        selectedSlots={selectedSlots}
        showPast={showPast}
        showFuture={showFuture}
        closedSlots={closedSlots}
        // handleCreateEvent={handleCreateEvent}
      />

      {/* Drawer for event creation */}
      {/* <Drawer
        anchor="right"
        open={showManager}
        onClose={() => setShowManager(false)}
        transitionDuration={500}
        PaperProps={{
          sx: { width: { xs: "100%", sm: 400 }, p: 3 },
        }}
      >
        <Typography variant="h6" mb={2}>
          New Booking
        </Typography>
        {selectedSlots ? (
          <>
            <TextField
              label="Start"
              value={
                selectedSlots.startStr
                  ? new Date(selectedSlots.startStr).toLocaleString()
                  : ""
              }
              fullWidth
              sx={{ mb: 2 }}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="End"
              value={
                selectedSlots.endStr
                  ? new Date(selectedSlots.endStr).toLocaleString()
                  : ""
              }
              fullWidth
              sx={{ mb: 2 }}
              InputProps={{ readOnly: true }}
            />
          </>
        ) : (
          <>
            <DateTimePicker
              label="Start"
              value={manualStart}
              onChange={setManualStart}
              sx={{ mb: 2 }}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <DateTimePicker
              label="End"
              value={manualEnd}
              onChange={setManualEnd}
              sx={{ mb: 2 }}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </>
        )}
        <TextField
          label="Event Title"
          fullWidth
          sx={{ mb: 2 }}
          value={newEventTitle}
          onChange={(e) => setNewEventTitle(e.target.value)}
        />
    
        <Button
          variant="contained"
          fullWidth
          onClick={handleCreateEvent}
          disabled={!newEventTitle}
        >
          Add Booking
        </Button>
      </Drawer> */}
    </Box>
  );
}
