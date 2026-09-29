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
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
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

// MUI's default number input renders the browser's native spinner arrows, which look
// broken against the rest of this app's styling -- hide them, keep the plain typed value.
const NO_SPINNER_SX = {
  "& input[type=number]": { MozAppearance: "textfield" },
  "& input[type=number]::-webkit-outer-spin-button": {
    WebkitAppearance: "none",
    margin: 0,
  },
  "& input[type=number]::-webkit-inner-spin-button": {
    WebkitAppearance: "none",
    margin: 0,
  },
};

const TIME_INPUT_SX = { width: 128 };

// Mirrors the label-left/control-right ".settings-row" pattern established in the design
// mockups (10-settings.html) -- reused here instead of stacking plain labeled fields.
function SettingsRow({
  label,
  description,
  last,
  children,
}: {
  label: string;
  description: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      spacing={3}
      sx={{
        py: 2,
        borderBottom: last ? "none" : "1px solid",
        borderColor: "divider",
      }}
    >
      <Box>
        <Typography variant="body2" fontWeight={500}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </Box>
      <Box sx={{ flexShrink: 0 }}>{children}</Box>
    </Stack>
  );
}

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

  // Copies this day's hours onto every other weekday (Mon-Fri) -- the common case of
  // "I work the same hours most days" shouldn't require re-entering them five times.
  const copyToWeekdays = (sourceDayIndex: number) => {
    const source = days[sourceDayIndex];
    const weekdayIndexes = [1, 2, 3, 4, 5];
    setDays((prev) =>
      prev.map((day, index) =>
        weekdayIndexes.includes(index) && index !== sourceDayIndex
          ? { enabled: true, ranges: source.ranges.map((range) => ({ ...range })) }
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

        <Card sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
            Weekly hours
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Manage your availability. Set one or more time ranges for each.
          </Typography>
          <Stack spacing={0.5}>
            {DAYS.map((label, dayIndex) => {
              const day = days[dayIndex];
              return (
                <Stack
                  key={label}
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{
                    py: 1.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    opacity: day.enabled ? 1 : 0.55,
                    transition: "opacity 150ms ease",
                    "&:last-of-type": { borderBottom: "none" },
                  }}
                >
                  <FormControlLabel
                    sx={{ width: 130, flexShrink: 0, m: 0 }}
                    control={<Switch checked={day.enabled} onChange={() => toggleDay(dayIndex)} />}
                    label={
                      <Typography variant="body2" fontWeight={500}>
                        {label}
                      </Typography>
                    }
                  />
                  {day.enabled ? (
                    <Stack spacing={1} flex={1}>
                      {day.ranges.map((range, rangeIndex) => (
                        <Stack direction="row" spacing={1} alignItems="center" key={rangeIndex}>
                          <TimePicker
                            value={dayjs(range.start_time, TIME_FORMAT)}
                            format="h:mm a"
                            onChange={(value) =>
                              value &&
                              updateRange(
                                dayIndex,
                                rangeIndex,
                                "start_time",
                                value.format(TIME_FORMAT)
                              )
                            }
                            slotProps={{ textField: { size: "small", sx: TIME_INPUT_SX } }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            –
                          </Typography>
                          <TimePicker
                            value={dayjs(range.end_time, TIME_FORMAT)}
                            format="h:mm a"
                            onChange={(value) =>
                              value &&
                              updateRange(
                                dayIndex,
                                rangeIndex,
                                "end_time",
                                value.format(TIME_FORMAT)
                              )
                            }
                            slotProps={{ textField: { size: "small", sx: TIME_INPUT_SX } }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => addRange(dayIndex)}
                            aria-label="Add another time range"
                            title="Add another time range"
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => copyToWeekdays(dayIndex)}
                            aria-label="Copy to weekdays"
                            title="Copy to Mon–Fri"
                          >
                            <ContentCopyOutlinedIcon fontSize="small" />
                          </IconButton>
                          {day.ranges.length > 1 && (
                            <IconButton
                              size="small"
                              onClick={() => removeRange(dayIndex, rangeIndex)}
                              aria-label="Remove time range"
                              title="Remove"
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.disabled">
                      Unavailable
                    </Typography>
                  )}
                </Stack>
              );
            })}
          </Stack>
        </Card>

        <Card sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
            Booking rules
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          </Typography>

          <SettingsRow
            label="Minimum notice"
            description="How soon before a slot can someone still book it."
          >
            <TextField
              type="number"
              size="small"
              sx={{ width: 140, ...NO_SPINNER_SX }}
              value={rules.min_notice_minutes}
              onChange={(e) =>
                setRules({ ...rules, min_notice_minutes: Number(e.target.value) })
              }
              slotProps={{ input: { endAdornment: <InputAdornment position="end">min</InputAdornment> } }}
            />
          </SettingsRow>

          <SettingsRow
            label="Maximum booking window"
            description="How far into the future someone can book."
          >
            <TextField
              type="number"
              size="small"
              sx={{ width: 140, ...NO_SPINNER_SX }}
              value={rules.max_booking_days}
              onChange={(e) => setRules({ ...rules, max_booking_days: Number(e.target.value) })}
              slotProps={{ input: { endAdornment: <InputAdornment position="end">days</InputAdornment> } }}
            />
          </SettingsRow>

          <SettingsRow
            label="Buffer before / after"
            description="Padding added around each booking to prevent back-to-backs."
          >
            <Stack direction="row" spacing={1.5}>
              <TextField
                type="number"
                size="small"
                sx={{ width: 110, ...NO_SPINNER_SX }}
                value={rules.buffer_before_minutes}
                onChange={(e) =>
                  setRules({ ...rules, buffer_before_minutes: Number(e.target.value) })
                }
                slotProps={{ input: { endAdornment: <InputAdornment position="end">min</InputAdornment> } }}
              />
              <TextField
                type="number"
                size="small"
                sx={{ width: 110, ...NO_SPINNER_SX }}
                value={rules.buffer_after_minutes}
                onChange={(e) =>
                  setRules({ ...rules, buffer_after_minutes: Number(e.target.value) })
                }
                slotProps={{ input: { endAdornment: <InputAdornment position="end">min</InputAdornment> } }}
              />
            </Stack>
          </SettingsRow>

          <SettingsRow
            label="Daily booking limit"
            description="Maximum number of bookings accepted per day. Leave blank for no limit."
          >
            <TextField
              type="number"
              size="small"
              placeholder="No limit"
              sx={{ width: 140, ...NO_SPINNER_SX }}
              value={rules.daily_booking_limit ?? ""}
              onChange={(e) =>
                setRules({
                  ...rules,
                  daily_booking_limit: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </SettingsRow>

          <SettingsRow
            label="Multiple bookings per slot"
            description="Allow more than one client to book the exact same time slot."
            last
          >
            <Switch
              checked={rules.allow_multiple_per_slot}
              onChange={(e) => setRules({ ...rules, allow_multiple_per_slot: e.target.checked })}
            />
          </SettingsRow>
        </Card>

        <Box>
          <Button variant="contained" size="large" onClick={handleSave} disabled={saving}>
            <ButtonContent processing={saving} defaultText="Save changes" />
          </Button>
        </Box>

        <Divider />

        <Card sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
            Date overrides
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            One-off exceptions to your weekly hours — a holiday, or a day with different hours.
          </Typography>

          {overrides.length === 0 ? (
            <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
              No overrides yet.
            </Typography>
          ) : (
            <Stack spacing={0.5} sx={{ mb: 3 }}>
              {overrides.map((override) => (
                <Stack
                  key={override.date}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    py: 1.25,
                    px: 1.5,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {dayjs(override.date).format("dddd, MMM D, YYYY")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {override.is_unavailable
                        ? "Unavailable all day"
                        : `${dayjs(override.start_time, TIME_FORMAT).format("h:mm a")} – ${dayjs(override.end_time, TIME_FORMAT).format("h:mm a")}`}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveOverride(override.date)}
                    aria-label="Remove override"
                    title="Remove"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          )}

          {overrideError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {overrideError}
            </Alert>
          )}

          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            sx={{ pt: overrides.length > 0 ? 2 : 0, borderTop: overrides.length > 0 ? "1px solid" : "none", borderColor: "divider" }}
          >
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
              label={
                <Typography variant="body2">Mark unavailable all day</Typography>
              }
            />
            {!overrideUnavailable && (
              <>
                <TimePicker
                  label="Start"
                  format="h:mm a"
                  value={overrideStart}
                  onChange={setOverrideStart}
                  slotProps={{ textField: { size: "small", sx: TIME_INPUT_SX } }}
                />
                <TimePicker
                  label="End"
                  format="h:mm a"
                  value={overrideEnd}
                  onChange={setOverrideEnd}
                  slotProps={{ textField: { size: "small", sx: TIME_INPUT_SX } }}
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
