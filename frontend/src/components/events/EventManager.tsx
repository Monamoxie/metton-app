import { Button, Drawer, TextField, Typography } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import React, { useRef, useState } from "react";

interface EventManagerProps {
  showManager: boolean;
  setShowManager: (arg: boolean) => void;
  selectedSlots: any; // todo
}

export default function EventManager(props: EventManagerProps) {
  const [manualStart, setManualStart] = useState<Date | null>(null);
  const [manualEnd, setManualEnd] = useState<Date | null>(null);
 
  const [newEventTitle, setNewEventTitle] = useState("");

  return (
    <Drawer
      anchor="right"
      open={props.showManager}
      onClose={() => props.setShowManager(false)}
      transitionDuration={500}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 400 }, p: 3 },
      }}
    >
      <Typography variant="h6" mb={2}>
        New Booking
      </Typography>
      {props.selectedSlots ? (
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
        // onClick={props.handleCreateEvent}
        disabled={!newEventTitle}
      >
        Add Booking
      </Button>
    </Drawer>
  );
}
