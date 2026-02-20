import { EventApi } from "@fullcalendar/core";

export interface SelectedSlot {
  startStr: string;
  endStr: string;
  event: EventApi;
}
