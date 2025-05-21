import { Button, Switch, FormControlLabel, Stack } from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import React, { useRef, useState } from "react";
import { SetStateProp } from "@/types/core";

interface EventToolBarProps {
  calendarRef: React.MutableRefObject<FullCalendar | null>;
  showPast: boolean;
  setShowPast: SetStateProp<boolean>;
  showFuture: boolean;
  setShowFuture: SetStateProp<boolean>;
}

export default function EventToolBar({
  calendarRef,
  showPast,
  setShowPast,
  showFuture,
  setShowFuture,
}: EventToolBarProps) {
  return (
    <Stack direction={"row"} spacing={2} mb={2} alignItems="center">
      <Button
        variant="contained"
        onClick={() => calendarRef.current?.getApi().today()}
      >
        Today
      </Button>
      <Button
        variant="outlined"
        onClick={() => calendarRef.current?.getApi().changeView("dayGridMonth")}
      >
        Month
      </Button>
      <Button
        variant="outlined"
        onClick={() => calendarRef.current?.getApi().changeView("timeGridWeek")}
      >
        Week
      </Button>
      <Button
        variant="outlined"
        onClick={() => calendarRef.current?.getApi().changeView("timeGridDay")}
      >
        Day
      </Button>
      <FormControlLabel
        control={
          <Switch checked={showPast} onChange={() => setShowPast((v) => !v)} />
        }
        label="Show Past"
      />
      <FormControlLabel
        control={
          <Switch
            checked={showFuture}
            onChange={() => setShowFuture((v) => !v)}
          />
        }
        label="Show Future"
      />
    </Stack>
  );
}
