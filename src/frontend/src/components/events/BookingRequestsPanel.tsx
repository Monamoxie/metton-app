import { Alert, Box, Chip, Stack, Typography } from "@mui/material";
import { CalendarBooking } from "@/types/event";
import BookingRequestCard from "./BookingRequestCard";

interface BookingRequestsPanelProps {
  requests: CalendarBooking[];
  busyBookingId: string | null;
  highlightedBookingId: string | null;
  error: string | null;
  onAccept: (booking: CalendarBooking) => void;
  onDecline: (booking: CalendarBooking) => void;
}

// One card per booking: a repeating request shows up once, not once per occurrence
export function uniquePendingBookings(
  bookings: CalendarBooking[]
): CalendarBooking[] {
  const firstSeen = new Map<string, CalendarBooking>();
  bookings
    .filter((booking) => booking.status === "pending")
    .forEach((booking) => {
      if (!firstSeen.has(booking.booking_id)) {
        firstSeen.set(booking.booking_id, booking);
      }
    });
  return [...firstSeen.values()];
}

export default function BookingRequestsPanel({
  requests,
  busyBookingId,
  highlightedBookingId,
  error,
  onAccept,
  onDecline,
}: BookingRequestsPanelProps) {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        alignSelf: "start",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Typography variant="subtitle2" fontWeight={600}>
          Booking requests
        </Typography>
        <Chip label={`${requests.length} pending`} size="small" variant="outlined" />
      </Stack>

      <Stack spacing={1.5} sx={{ p: 1.5 }}>
        {error && <Alert severity="error">{error}</Alert>}
        {requests.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ p: 2, textAlign: "center" }}
          >
            No requests waiting for you in this view.
          </Typography>
        ) : (
          requests.map((booking) => (
            <BookingRequestCard
              key={booking.booking_id}
              booking={booking}
              busy={busyBookingId === booking.booking_id}
              highlighted={highlightedBookingId === booking.booking_id}
              onAccept={onAccept}
              onDecline={onDecline}
            />
          ))
        )}
      </Stack>
    </Box>
  );
}
