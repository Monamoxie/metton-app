"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import ButtonContent from "@/components/ButtonContent";
import { AvailableSlot } from "@/types/schedule";
import { CreateBookingInput, RepeatType } from "@/types/booking";

interface ConfirmBookingFormProps {
  selectedDate: Dayjs;
  selectedSlot: AvailableSlot;
  duration: number;
  onSubmit: (input: CreateBookingInput) => void;
  submitting: boolean;
  errors: { [key: string]: string[] } | null;
}

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const ConfirmBookingForm: React.FC<ConfirmBookingFormProps> = ({
  selectedDate,
  selectedSlot,
  duration,
  onSubmit,
  submitting,
  errors,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [repeatType, setRepeatType] = useState<RepeatType>("no");
  const [days, setDays] = useState<string[]>([]);
  const [endRecur, setEndRecur] = useState<Dayjs | null>(null);

  const toggleDay = (day: string) => {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleSubmit = () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    onSubmit({
      start_date: dayjs(selectedSlot.start).format("YYYY-MM-DD"),
      start_time: dayjs(selectedSlot.start).format("HH:mm:ss"),
      end_date: dayjs(selectedSlot.end).format("YYYY-MM-DD"),
      end_time: dayjs(selectedSlot.end).format("HH:mm:ss"),
      title: `${firstName} ${lastName}`.trim(),
      email,
      note,
      user_timezone: timezone,
      repeat_type: repeatType,
      days: repeatType === "weekly" ? days : undefined,
      end_recur: repeatType !== "no" ? endRecur?.format("YYYY-MM-DD") : undefined,
    });
  };

  const fieldError = (field: string) => errors?.[field]?.[0];
  const nonFieldError = errors?.["non_field_errors"]?.[0] || errors?.["_message"]?.[0];

  return (
      <Box sx={{ mt: 3.5, pt: 3, borderTop: "1px solid", borderColor: "divider" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Confirm your details
        </Typography>

        <Box
          sx={{
            bgcolor: "action.hover",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            p: 2,
            mb: 2,
          }}
        >
          <Typography variant="body2">
            <strong>
              {selectedDate.format("dddd, MMMM D")} at {dayjs(selectedSlot.start).format("h:mm A")}
            </strong>
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {duration} min
          </Typography>
        </Box>

        {nonFieldError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {nonFieldError}
          </Alert>
        )}

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 1.5 }}>
          <TextField
            label="First name"
            size="small"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            label="Last name"
            size="small"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </Box>
        <TextField
          label="Email address"
          type="email"
          size="small"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={Boolean(fieldError("email"))}
          helperText={fieldError("email")}
          sx={{ mb: 1.5 }}
        />
        <TextField
          label="Anything you'd like to discuss?"
          size="small"
          fullWidth
          multiline
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          select
          label="Repeats"
          size="small"
          fullWidth
          value={repeatType}
          onChange={(e) => setRepeatType(e.target.value as RepeatType)}
          sx={{ mb: repeatType === "no" ? 2 : 1.5 }}
        >
          <MenuItem value="no">Does not repeat</MenuItem>
          <MenuItem value="daily">Daily</MenuItem>
          <MenuItem value="weekly">Weekly</MenuItem>
        </TextField>

        {repeatType === "weekly" && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
              On these days
            </Typography>
            <ToggleButtonGroup size="small" value={days} onChange={() => {}}>
              {DAY_LABELS.map((label, index) => (
                <ToggleButton
                  key={index}
                  value={String(index)}
                  selected={days.includes(String(index))}
                  onClick={() => toggleDay(String(index))}
                >
                  {label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            {fieldError("days") && (
              <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
                {fieldError("days")}
              </Typography>
            )}
          </Box>
        )}

        {repeatType !== "no" && (
          <DatePicker
            label="Repeat until"
            value={endRecur}
            onChange={setEndRecur}
            minDate={selectedDate}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
                error: Boolean(fieldError("end_recur")),
                helperText: fieldError("end_recur"),
              },
            }}
            sx={{ mb: 2, width: "100%" }}
          />
        )}

        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={submitting || !email}
          onClick={handleSubmit}
        >
          <ButtonContent processing={submitting} defaultText="Confirm booking" />
        </Button>
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", textAlign: "center", mt: 1.25 }}>
          You&apos;ll receive a confirmation once this is booked.
        </Typography>
      </Box>
  );
};

export default ConfirmBookingForm;
