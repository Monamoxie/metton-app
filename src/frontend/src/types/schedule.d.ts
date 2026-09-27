export interface WeeklyHoursEntry {
  day_of_week: number; // 0=Sunday .. 6=Saturday
  start_time: string; // "HH:mm:ss" or "HH:mm"
  end_time: string;
}

export interface ScheduleOverride {
  date: string; // "YYYY-MM-DD"
  is_unavailable: boolean;
  start_time?: string | null;
  end_time?: string | null;
}

export interface BookingRules {
  min_notice_minutes: number;
  max_booking_days: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  daily_booking_limit: number | null;
  allow_multiple_per_slot: boolean;
}

export interface Schedule {
  id: number;
  name: string;
  timezone: string;
  is_default: boolean;
  weekly_hours: WeeklyHoursEntry[];
  overrides: ScheduleOverride[];
  booking_rules: BookingRules | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateScheduleInput {
  name?: string;
  timezone?: string;
  weekly_hours?: WeeklyHoursEntry[];
  booking_rules?: Partial<BookingRules>;
}

export interface AvailableSlot {
  start: string;
  end: string;
}
