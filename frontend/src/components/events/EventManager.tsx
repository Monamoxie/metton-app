import { SelectedSlot } from "@/types/event";
import { Button, Drawer, TextField, Typography } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import React, { useRef, useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { DateInput, EventInput } from "@fullcalendar/core";

interface EventManagerProps {
  showManager: boolean;
  setShowManager: (arg: boolean) => void;
  selectedSlots: SelectedSlot;
  closedSlots: any; // todo
  showPast: boolean;
  showFuture: boolean;
  allEvents: EventInput[]
}

export default function EventManager(props: EventManagerProps) {
  const [manualStart, setManualStart] = useState<Dayjs | null>(null);
  const [manualEnd, setManualEnd] = useState<Dayjs | null>(null);

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const [newEventTitle, setNewEventTitle] = useState("");

  const allowMultipleBookingsPerSlot = false; // TODO ::: include this option as a setting that is controlled by the owner of this calendar

  return (
    <Drawer
      anchor="right"
      open={props.showManager}
      onClose={() => props.setShowManager(false)}
      transitionDuration={500}
      // slotProps={{ sx: { width: { xs: "100%", sm: 400 }, p: 3 } }}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 400 }, p: 3 },
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Typography variant="h6" mb={2}>
          New Booking
        </Typography>

        <DateTimePicker
          label="Start"
          value={
            props.selectedSlots?.startStr
              ? dayjs(props.selectedSlots.startStr)
              : manualStart
          }
          onChange={setManualStart}
          // minDateTime={minDate} // e.g., new Date()
          // maxDateTime={maxDate} // e.g., new Date('2025-12-31')
          shouldDisableDate={(date) =>
            isDateClosedOrBlocked(
              date,
              props.closedSlots,
              props.showPast,
              props.showFuture
            )
          }
          shouldDisableTime={(timeValue, clockType) => {
            if (clockType !== "hours") return false; // Only check hours, or adapt for minutes 
            
            const base = manualStart ?? dayjs();
            // @ts-ignore
            const slot = base.hour(timeValue).minute(0).second(0);
            
            return isTimeSlotBooked(
              slot,
              props.allEvents,
              allowMultipleBookingsPerSlot
            );
          }} 
        />

        {/* {props.selectedSlots ? (
        <>
          <TextField
            label="Start"
            value={
              props.selectedSlots.startStr
                ? new Date(props.selectedSlots.startStr).toLocaleString()
                : ""
            }
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="End"
            value={
              props.selectedSlots.endStr
                ? new Date(props.selectedSlots.endStr).toLocaleString()
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
      )} */}

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
          // onClick={props.handleCreateEvent}
          disabled={!newEventTitle}
        >
          Add Booking
        </Button>
      </LocalizationProvider>
    </Drawer>
  );
}

type ClosedSlot = { start: string; end?: string };
type BackgroundEvent = { start: string; end?: string };

function isDateClosedOrBlocked(
  date: Dayjs,
  closedSlots: ClosedSlot[],
  showPast: boolean,
  showFuture: boolean
): boolean {
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

type Booking = { start: string; end: string }; // or your event type

function isTimeSlotBooked(
  slot: Dayjs,
  bookings: EventInput[],
  allowMultiple: boolean
): boolean {
  if (allowMultiple) return false; // Always allow booking
 
  return bookings.some((booking) => {
    console.log("HELLLLLLLLLLLLLLLLLLLLLOOOOOOOOOOOOOOOO")
    console.log(booking)
    const bookingStart = dayjs(booking.start as string);
    const bookingEnd = dayjs(booking.end as string); 

    return (
      (slot.isAfter(bookingStart) || slot.isSame(bookingStart)) &&
      slot.isBefore(bookingEnd)
    );
  });
}
