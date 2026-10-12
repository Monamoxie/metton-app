export interface PublicHostProfile {
  name: string;
  company: string;
  position: string;
  profile_summary: string;
  profile_photo: string;
}

export type RepeatType = "no" | "daily" | "weekly";

export interface CreateBookingInput {
  start_date: string; // "YYYY-MM-DD"
  start_time: string; // "HH:mm:ss"
  end_date: string;
  end_time: string;
  title?: string;
  email: string;
  note?: string;
  user_timezone: string;
  repeat_type: RepeatType;
  days?: string[]; // "0".."6", only for weekly
  end_recur?: string | null; // "YYYY-MM-DD"
}

export interface Booking {
  id: string;
  title: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  frequency: string;
  end_recur: string | null;
}
