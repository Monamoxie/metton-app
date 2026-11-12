import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { UseMediaQueryOptions } from "@mui/system/useMediaQuery";
import { DateInput, EventInput } from "@fullcalendar/core";
import { DateSelectArg, DatesSetArg } from "@fullcalendar/core";
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
  handleDatesSet?: (range: DatesSetArg) => void;
}

export default function EventCalendar(props: EventCalendarProps) {
  // Destructured so the React Compiler lint only treats calendarRef as a ref, not all of props
  const {
    calendarRef,
    isMobile,
    showPast,
    showFuture,
    events,
    handleDateSelect,
    isSlotClosed,
    handleEventClick,
    handleDatesSet,
  } = props;

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.start as Date);
    const now = new Date();
    if (!showPast && eventDate < now) return false;
    if (!showFuture && eventDate > now) return false;
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
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
        selectable
        selectMirror
        events={filteredEvents}
        select={handleDateSelect}
        eventColor={"#008000"} // todo
        eventContent={renderEventContent}
        validRange={{
          start: showPast
            ? undefined
            : new Date().toISOString().slice(0, 10),
          end: showFuture
            ? undefined
            : new Date().toISOString().slice(0, 10),
        }}
        selectAllow={(selectInfo) => !isSlotClosed(selectInfo)}
        dayCellClassNames={(arg) =>
          isSlotClosed(arg) ? ["fc-closed-slot"] : []
        }
        selectOverlap={(event) => true} // todo: configurable
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
      />
    </Box>
  );
}
