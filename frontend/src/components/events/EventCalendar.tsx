import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { UseMediaQueryOptions } from "@mui/system/useMediaQuery";
import { DateInput, EventInput } from "@fullcalendar/core";
import { DateSelectArg } from "@fullcalendar/core";
import { Chip, Tooltip, Box } from "@mui/material";
import { EVENT_CALENDAR } from "@/styles/modules/event.css";

interface EventCalendarProps {
  calendarRef: React.MutableRefObject<FullCalendar | null>;
  isMobile: boolean;
  showPast: boolean;
  showFuture: boolean;
  events: EventInput[];
  handleDateSelect: (selectInfo: DateSelectArg) => void;
  isSlotClosed: (slot: any) => boolean;
  handleEventClick?: (info: any) => void;
}

export default function EventCalendar(props: EventCalendarProps) {
  const filteredEvents = props.events.filter((event) => {
    const eventDate = new Date(event.start as Date);
    const now = new Date();
    if (!props.showPast && eventDate < now) return false;
    if (!props.showFuture && eventDate > now) return false;
    return true;
  });

  const renderEventContent = (eventInfo: any) => {
    if (eventInfo.event.display === "background") {
      return <Box className="event-closed-slots">{eventInfo.event.title}</Box>;
    }

    // Normal event
    return (
      <Tooltip title={eventInfo.event.title}>
        <Chip
          label={eventInfo.event.title}
          color="primary"
          size="small"
          sx={{ fontWeight: "bold", bgcolor: "#333", color: "#fff" }}
        />
      </Tooltip>
    );
  };

  return (
    <Box sx={EVENT_CALENDAR}>
      <FullCalendar
        ref={props.calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={props.isMobile ? "timeGridDay" : "timeGridWeek"}
        selectable
        selectMirror
        events={filteredEvents}
        select={props.handleDateSelect}
        eventColor={"#008000"} // todo
        eventContent={renderEventContent}
        validRange={{
          start: props.showPast
            ? undefined
            : new Date().toISOString().slice(0, 10),
          end: props.showFuture
            ? undefined
            : new Date().toISOString().slice(0, 10),
        }}
        selectAllow={(selectInfo) => !props.isSlotClosed(selectInfo)}
        dayCellClassNames={(arg) =>
          props.isSlotClosed(arg) ? ["fc-closed-slot"] : []
        }
        selectOverlap={(event) => true} // todo: configurable
        eventClick={props.handleEventClick}
      />
    </Box>
  );
}
