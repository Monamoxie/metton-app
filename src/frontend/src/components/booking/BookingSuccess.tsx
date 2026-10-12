"use client";

import { Box, Button, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import dayjs, { Dayjs } from "dayjs";
import { AvailableSlot } from "@/types/schedule";

interface BookingSuccessProps {
  selectedDate: Dayjs;
  selectedSlot: AvailableSlot;
  hostName: string;
  onBookAnother: () => void;
}

const BookingSuccess: React.FC<BookingSuccessProps> = ({
  selectedDate,
  selectedSlot,
  hostName,
  onBookAnother,
}) => {
  return (
    <Box sx={{ textAlign: "center", p: { xs: 4, md: 6 } }}>
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          bgcolor: "success.main",
          opacity: 0.9,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 2.5,
        }}
      >
        <CheckIcon sx={{ color: "#fff", fontSize: 30 }} />
      </Box>
      <Typography sx={{ fontFamily: "var(--font-display)", fontSize: 26, mb: 1 }}>
        You&apos;re booked!
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 3.5 }}>
        Your time with {hostName} is confirmed.
      </Typography>

      <Box
        sx={{
          bgcolor: "action.hover",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          p: 2,
          textAlign: "left",
          mb: 3,
        }}
      >
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>
            {selectedDate.format("dddd, MMMM D")} at{" "}
            {dayjs(selectedSlot.start).format("h:mm A")}
          </strong>
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          with {hostName}
        </Typography>
      </Box>

      <Button variant="outlined" onClick={onBookAnother}>
        Book another time
      </Button>
    </Box>
  );
};

export default BookingSuccess;
