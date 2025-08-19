import { SelectedSlot } from "@/types/event";
import { Button, Drawer, TextField, Typography } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import React, { useRef, useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { EventInput } from "@fullcalendar/core";
import { Select, MenuItem, InputLabel, FormControl, Checkbox, ListItemText } from "@mui/material";
import * as EventService from "@/services/event-service"

interface EventManagerProps {
  showManager: boolean;
  setShowManager: (arg: boolean) => void;
  selectedSlots: SelectedSlot;
  closedSlots: any; // todo
  showPast: boolean;
  showFuture: boolean;
  allEvents: EventInput[]
}

const repeatOptions = ["No Repeat", "Repeat"];
const frequencyOptions = ["Daily", "Weekly", "Monthly", "Yearly", "Custom"];
const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function EventManager(props: EventManagerProps) {
  const [manualStart, setManualStart] = useState<Dayjs | null>(null);
  const [manualEnd, setManualEnd] = useState<Dayjs | null>(null);

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const [newEventTitle, setNewEventTitle] = useState("");

  const allowMultipleBookingsPerSlot = false; // TODO ::: include this option as a setting controlled by the owner of this calendar

  const [selected, setSelected] = useState<string[]>([]);
  const options = ["No Repeat", "Daily", "Weekly", "Monthly", "Yearly"];

  // todo ::: "Custom"

  const [repeat, setRepeat] = useState<string>("No Repeat");
  const [frequency, setFrequency] = useState<string>("");
  const [customDays, setCustomDays] = useState<string[]>([]);
  const [repeatEnd, setRepeatEnd] = useState<Dayjs | null>(null);

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
            EventService.isDateClosedOrBlocked(
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
            
            return EventService.isTimeSlotBooked(
              slot,
              props.allEvents,
              allowMultipleBookingsPerSlot
            );
          }} 
        />

         <DateTimePicker
          label="End"
          value={
            props.selectedSlots?.endStr
              ? dayjs(props.selectedSlots.endStr)
              : manualEnd
          }
          onChange={setManualEnd}
          // minDateTime={minDate} // e.g., new Date()
          // maxDateTime={maxDate} // e.g., new Date('2025-12-31')
          shouldDisableDate={(date) =>
            EventService.isDateClosedOrBlocked(
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
            
            return EventService.isTimeSlotBooked(
              slot,
              props.allEvents,
              allowMultipleBookingsPerSlot
            );
          }} 
        />
 
      <FormControl fullWidth sx={{ mt: 2 }}>
        <TextField
          label="Event Title"
          fullWidth
          sx={{ mt: 2 }}
          value={newEventTitle}
          onChange={(e) => setNewEventTitle(e.target.value)}
          />
      </FormControl>

      {/* <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel id="multi-select-label">Repeat</InputLabel>
        <Select
          labelId="multi-select-label"
          value={selected}
          // onChange={(e) => setSelected(e.target.value as string[])}
          label="Repeat"
            // renderValue={(selected) => selected.join(", ")}
            // renderValue={selected}
        >
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              <Checkbox checked={selected.indexOf(option) > -1} />
              <ListItemText primary={option} />
            </MenuItem>
          ))}
        </Select>
      </FormControl> */}
       
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel id="repeat-label">Repeat</InputLabel>
        <Select
          labelId="repeat-label"
          value={repeat}
          onChange={(e) => setRepeat(e.target.value as string)}
          label="Repeat"
        >
          {repeatOptions.map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </Select>
        </FormControl>
        
      {/* Frequency Select (shown only if Repeat is selected) */}
      {repeat === "Repeat" && (
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="frequency-label">Frequency</InputLabel>
          <Select
            labelId="frequency-label"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as string)}
            label="Frequency"
          >
            {frequencyOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
        )}
        
      {/* Custom Days Select (shown only if Custom is selected) */}
      {repeat === "Repeat" && frequency === "Custom" && (
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="custom-days-label">Days of Week</InputLabel>
          <Select
            labelId="custom-days-label"
            multiple
            value={customDays}
            onChange={(e) => setCustomDays(e.target.value as string[])}
            renderValue={(selected) => selected.join(", ")}
            label="Days of Week"
          >
            {daysOfWeek.map((day) => (
              <MenuItem key={day} value={day}>
                <Checkbox checked={customDays.indexOf(day) > -1} />
                <ListItemText primary={day} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

         {/* Repeat End Date (shown only if Repeat is selected) */}
      {repeat === "Repeat" && (
        <FormControl fullWidth sx={{ mt: 2 }}>
          <DateTimePicker
            label="Repeat End Date"
            value={repeatEnd}
            onChange={setRepeatEnd}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </FormControl>
      )}


        <Button
          variant="contained"
          sx={{mt: 8}}
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




