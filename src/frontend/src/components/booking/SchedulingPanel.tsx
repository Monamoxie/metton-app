"use client";

import { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs, { Dayjs } from "dayjs";
import * as BookingService from "@/services/booking-service";
import { AvailableSlot } from "@/types/schedule";

interface SchedulingPanelProps {
  publicId: string;
  duration: number;
  selectedDate: Dayjs;
  onSelectDate: (date: Dayjs) => void;
  selectedSlot: AvailableSlot | null;
  onSelectSlot: (slot: AvailableSlot) => void;
}

const SchedulingPanel: React.FC<SchedulingPanelProps> = ({
  publicId,
  duration,
  selectedDate,
  onSelectDate,
  selectedSlot,
  onSelectSlot,
}) => {
  const [month, setMonth] = useState<Dayjs>(selectedDate.startOf("month"));
  const [monthSlots, setMonthSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const fetchSlots = async () => {
      const response = await BookingService.getAvailableSlots(
        publicId,
        month.startOf("month").format("YYYY-MM-DD"),
        month.endOf("month").format("YYYY-MM-DD"),
        duration
      );
      if (!cancelled) {
        setMonthSlots(response.code === 200 ? response.data?.slots ?? [] : []);
        setLoading(false);
      }
    };

    fetchSlots();
    return () => {
      cancelled = true;
    };
  }, [publicId, month, duration]);

  const availableDates = new Set(
    monthSlots.map((slot) => dayjs(slot.start).format("YYYY-MM-DD"))
  );

  const daySlots = monthSlots.filter(
    (slot) => dayjs(slot.start).format("YYYY-MM-DD") === selectedDate.format("YYYY-MM-DD")
  );

  return (
    <Box sx={{ p: { xs: 3, md: 4.5 } }}>
      <Typography sx={{ fontFamily: "var(--font-display)", fontSize: 22, mb: 0.5 }}>
        Select a date &amp; time
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
        {duration}-minute meeting
      </Typography>

      <DateCalendar
        value={selectedDate}
        onChange={(date) => date && onSelectDate(date)}
        onMonthChange={(date) => setMonth(date.startOf("month"))}
        disablePast
        shouldDisableDate={(day) => !availableDates.has(day.format("YYYY-MM-DD"))}
        sx={{
          width: "100%",
          "& .MuiPickersDay-root.Mui-selected": {
            bgcolor: "primary.main",
            color: "primary.contrastText",
          },
          "& .MuiPickersDay-today": { borderColor: "primary.main" },
        }}
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          Available times
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          {selectedDate.format("dddd, MMMM D")}
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : daySlots.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 4 }}>
            No times available this day
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" },
              gap: 1,
              maxHeight: 280,
              overflowY: "auto",
            }}
          >
            {daySlots.map((slot) => {
              const isSelected = selectedSlot?.start === slot.start;
              return (
                <Box
                  key={slot.start}
                  onClick={() => onSelectSlot(slot)}
                  sx={{
                    py: 1.25,
                    px: 1,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: isSelected ? "primary.main" : "divider",
                    bgcolor: isSelected ? "action.selected" : "action.hover",
                    textAlign: "center",
                    fontSize: 13,
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected ? "primary.main" : "text.secondary",
                    cursor: "pointer",
                    "&:hover": { borderColor: "primary.main", color: "primary.main" },
                  }}
                >
                  {dayjs(slot.start).format("h:mm A")}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SchedulingPanel;
