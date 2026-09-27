"use client";

import { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import * as ScheduleService from "@/services/schedule-service";
import CircularProgressBox from "@/components/loaders/CircularProgressBox";
import ButtonContent from "@/components/ButtonContent";
import {
  BookingRules,
  Schedule,
  ScheduleOverride,
  WeeklyHoursEntry,
} from "@/types/schedule";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const TIME_FORMAT = "HH:mm:ss";

const DEFAULT_RULES: BookingRules = {
  min_notice_minutes: 120,
  max_booking_days: 60,
  buffer_before_minutes: 0,
  buffer_after_minutes: 0,
  daily_booking_limit: null,
  allow_multiple_per_slot: false,
};

type DayRange = { start_time: string; end_time: string };
type DayState = { enabled: boolean; ranges: DayRange[] };

function buildDayState(weeklyHours: WeeklyHoursEntry[]): DayState[] {
  return DAYS.map((_, dayIndex) => {
    const ranges = weeklyHours
      .filter((entry) => entry.day_of_week === dayIndex)
      .map((entry) => ({ start_time: entry.start_time, end_time: entry.end_time }));
    return {
      enabled: ranges.length > 0,
      ranges: ranges.length > 0 ? ranges : [{ start_time: "09:00:00", end_time: "17:00:00" }],
    };
  });
}

export default function AvailabilityCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [days, setDays] = useState<DayState[]>(buildDayState([]));
  const [rules, setRules] = useState<BookingRules>(DEFAULT_RULES);
  const [overrides, setOverrides] = useState<ScheduleOverride[]>([]);

  const [overrideDate, setOverrideDate] = useState<Dayjs | null>(null);
  const [overrideUnavailable, setOverrideUnavailable] = useState(true);
  const [overrideStart, setOverrideStart] = useState<Dayjs | null>(
    dayjs().hour(9).minute(0).second(0)
  );
  const [overrideEnd, setOverrideEnd] = useState<Dayjs | null>(
    dayjs().hour(17).minute(0).second(0)
  );
  const [addingOverride, setAddingOverride] = useState(false);
  const [overrideError, setOverrideError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      const response = await ScheduleService.getSchedule();

      if (response.code === 200) {
        const schedule: Schedule = response.data.schedule;
        setDays(buildDayState(schedule.weekly_hours));
        setRules(schedule.booking_rules || DEFAULT_RULES);
        setOverrides(schedule.overrides);
      } else if (response.code !== 404) {
        // 404 just means no schedule exists yet -- a normal first-time state, not an error.
        setError(response.message || "Unable to load your availability.");
      }

      setLoading(false);
    };

    fetchSchedule();
  }, []);

  const toggleDay = (dayIndex: number) => {
    setDays((prev) =>
      prev.map((day, index) => (index === dayIndex ? { ...day, enabled: !day.enabled } : day))
    );
  };

  const updateRange = (
    dayIndex: number,
    rangeIndex: number,
    field: "start_time" | "end_time",
    value: string
  ) => {
    setDays((prev) =>
      prev.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              ranges: day.ranges.map((range, rIndex) =>
                rIndex === rangeIndex ? { ...range, [field]: value } : range
              ),
            }
          : day
      )
    );
  };

  const addRange = (dayIndex: number) => {
    setDays((prev) =>
      prev.map((day, index) =>
        index === dayIndex
          ? { ...day, ranges: [...day.ranges, { start_time: "09:00:00", end_time: "17:00:00" }] }
          : day
      )
    );
  };

  const removeRange = (dayIndex: number, rangeIndex: number) => {
    setDays((prev) =>
      prev.map((day, index) =>
        index === dayIndex
          ? { ...day, ranges: day.ranges.filter((_, rIndex) => rIndex !== rangeIndex) }
          : day
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const weekly_hours: WeeklyHoursEntry[] = days.flatMap((day, dayIndex) =>
        day.enabled ? day.ranges.map((range) => ({ day_of_week: dayIndex, ...range })) : []
      );

      const response = await ScheduleService.updateSchedule({
        weekly_hours,
        booking_rules: rules,
      });

      if (response.code !== 200) {
        setError(response.message || "Unable to save your availability.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddOverride = async () => {
    if (!overrideDate) return;

    setAddingOverride(true);
    setOverrideError(null);
    try {
      const response = await ScheduleService.addOverride({
        date: overrideDate.format("YYYY-MM-DD"),
        is_unavailable: overrideUnavailable,
        start_time: overrideUnavailable ? null : overrideStart?.format(TIME_FORMAT),
        end_time: overrideUnavailable ? null : overrideEnd?.format(TIME_FORMAT),
      });

      if (response.code !== 201) {
        setOverrideError(response.message || "Unable to add this override.");
        return;
      }

      setOverrides((prev) => [...prev, response.data.override]);
      setOverrideDate(null);
    } finally {
      setAddingOverride(false);
    }
  };

  const handleRemoveOverride = async (date: string) => {
    const response = await ScheduleService.removeOverride(date);
    if (response.code === 200) {
      setOverrides((prev) => prev.filter((override) => override.date !== date));
    }
  };

  if (loading) {
    return <CircularProgressBox />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack spacing={3}>
        {error && <Alert severity="error">{error}</Alert>}

        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Weekly hours
          </Typography>
          <Stack spacing={2}>
            {DAYS.map((label, dayIndex) => {
              const day = days[dayIndex];
              return (
                <Stack
                  key={label}
                  direction="row"
                  alignItems="flex-start"
                  spacing={2}
                  sx={{ py: 1, borderBottom: "1px solid", borderColor: "divider" }}
                >
                  <FormControlLabel
                    sx={{ width: 140, flexShrink: 0 }}
                    control={<Switch checked={day.enabled} onChange={() => toggleDay(dayIndex)} />}
                    label={label}
                  />
                  {day.enabled && (
                    <Stack spacing={1} flex={1}>
                      {day.ranges.map((range, rangeIndex) => (
                        <Stack direction="row" spacing={1} alignItems="center" key={rangeIndex}>
                          <TimePicker
                            value={dayjs(range.start_time, TIME_FORMAT)}
                            onChange={(value) =>
                              value &&
                              updateRange(
                                dayIndex,
                                rangeIndex,
                                "start_time",
                                value.format(TIME_FORMAT)
                              )
                            }
                            slotProps={{ textField: { size: "small" } }}
                          />
                          <Typography variant="body2">to</Typography>
                          <TimePicker
                            value={dayjs(range.end_time, TIME_FORMAT)}
                            onChange={(value) =>
                              value &&
                              updateRange(
                                dayIndex,
                                rangeIndex,
                                "end_time",
                                value.format(TIME_FORMAT)
                              )
                            }
                            slotProps={{ textField: { size: "small" } }}
                          />
                          {day.ranges.length > 1 && (
                            <IconButton
                              size="small"
                              onClick={() => removeRange(dayIndex, rangeIndex)}
                              aria-label="Remove time range"
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          )}
                          {rangeIndex === day.ranges.length - 1 && (
                            <IconButton
                              size="small"
                              onClick={() => addRange(dayIndex)}
                              aria-label="Add another time range"
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </Stack>
              );
            })}
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Booking rules
          </Typography>
          <Stack spacing={2} sx={{ maxWidth: 360 }}>
            <TextField
              label="Minimum notice (minutes)"
              type="number"
              size="small"
              value={rules.min_notice_minutes}
              onChange={(e) =>
                setRules({ ...rules, min_notice_minutes: Number(e.target.value) })
              }
            />
            <TextField
              label="Maximum booking window (days)"
              type="number"
              size="small"
              value={rules.max_booking_days}
              onChange={(e) => setRules({ ...rules, max_booking_days: Number(e.target.value) })}
            />
            <TextField
              label="Buffer before (minutes)"
              type="number"
              size="small"
              value={rules.buffer_before_minutes}
              onChange={(e) =>
                setRules({ ...rules, buffer_before_minutes: Number(e.target.value) })
              }
            />
            <TextField
              label="Buffer after (minutes)"
              type="number"
              size="small"
              value={rules.buffer_after_minutes}
              onChange={(e) =>
                setRules({ ...rules, buffer_after_minutes: Number(e.target.value) })
              }
            />
            <TextField
              label="Daily booking limit (blank = no limit)"
              type="number"
              size="small"
              value={rules.daily_booking_limit ?? ""}
              onChange={(e) =>
                setRules({
                  ...rules,
                  daily_booking_limit: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={rules.allow_multiple_per_slot}
                  onChange={(e) =>
                    setRules({ ...rules, allow_multiple_per_slot: e.target.checked })
                  }
                />
              }
              label="Allow multiple bookings for the same time slot"
            />
          </Stack>
        </Card>

        <Box>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            <ButtonContent processing={saving} defaultText="Save changes" />
          </Button>
        </Box>

        <Divider />

        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Date overrides
          </Typography>

          <Stack spacing={1} sx={{ mb: 3 }}>
            {overrides.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No overrides yet.
              </Typography>
            )}
            {overrides.map((override) => (
              <Stack
                key={override.date}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ py: 1, borderBottom: "1px solid", borderColor: "divider" }}
              >
                <Typography variant="body2">
                  {override.date} —{" "}
                  {override.is_unavailable
                    ? "Unavailable"
                    : `${override.start_time} – ${override.end_time}`}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveOverride(override.date)}
                  aria-label="Remove override"
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
          </Stack>

          {overrideError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {overrideError}
            </Alert>
          )}

          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
            <DatePicker
              label="Date"
              value={overrideDate}
              onChange={setOverrideDate}
              slotProps={{ textField: { size: "small" } }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={overrideUnavailable}
                  onChange={(e) => setOverrideUnavailable(e.target.checked)}
                />
              }
              label="Mark unavailable all day"
            />
            {!overrideUnavailable && (
              <>
                <TimePicker
                  label="Start"
                  value={overrideStart}
                  onChange={setOverrideStart}
                  slotProps={{ textField: { size: "small" } }}
                />
                <TimePicker
                  label="End"
                  value={overrideEnd}
                  onChange={setOverrideEnd}
                  slotProps={{ textField: { size: "small" } }}
                />
              </>
            )}
            <Button
              variant="outlined"
              onClick={handleAddOverride}
              disabled={addingOverride || !overrideDate}
            >
              <ButtonContent processing={addingOverride} defaultText="Add override" />
            </Button>
          </Stack>
        </Card>
      </Stack>
    </LocalizationProvider>
  );
}
