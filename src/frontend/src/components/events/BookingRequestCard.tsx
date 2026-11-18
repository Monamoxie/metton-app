import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { CalendarBooking } from "@/types/event";

interface BookingRequestCardProps {
  booking: CalendarBooking;
  busy: boolean;
  highlighted?: boolean;
  onAccept: (booking: CalendarBooking) => void;
  onDecline: (booking: CalendarBooking) => void;
}

export function describeBookingTime(booking: CalendarBooking) {
  const start = dayjs(booking.start);
  const end = dayjs(booking.end);
  const day = start.format("ddd D MMM");
  const when = `${start.format("h:mm A")} – ${end.format("h:mm A")}`;
  return booking.is_recurring ? `↻ ${day} · ${when}` : `${day} · ${when}`;
}

export default function BookingRequestCard({
  booking,
  busy,
  highlighted,
  onAccept,
  onDecline,
}: BookingRequestCardProps) {
  const guest = booking.attendees.join(", ");

  return (
    <Box
      data-testid="booking-request"
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: highlighted ? "text.secondary" : "divider",
        borderRadius: 2,
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={1}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {booking.title || guest}
          </Typography>
          {booking.title && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {guest}
            </Typography>
          )}
        </Box>
        <Chip label="Pending" size="small" variant="outlined" />
      </Stack>

      <Typography variant="body2" sx={{ mt: 1.5 }}>
        {describeBookingTime(booking)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {booking.timezone}
      </Typography>
      {booking.note && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1, fontStyle: "italic" }}
        >
          “{booking.note}”
        </Typography>
      )}

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button
          fullWidth
          size="small"
          variant="outlined"
          color="inherit"
          disabled={busy}
          onClick={() => onDecline(booking)}
        >
          Decline
        </Button>
        <Button
          fullWidth
          size="small"
          variant="contained"
          disabled={busy}
          onClick={() => onAccept(booking)}
        >
          Accept
        </Button>
      </Stack>
    </Box>
  );
}
