import { Box, Button, Popover, Typography } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { SetStateProp } from "@/types/core";

interface CalendarSlotActionProps {
  anchorEl: null | HTMLElement;
  setAnchorEl: SetStateProp<null | HTMLElement>;
  isSlotClosed: (slot: any) => boolean;
  selectedSlots: any;
}

export default function CalendarSlotMenu(props: CalendarSlotActionProps) {
  const isMobile = useMediaQuery(useTheme().breakpoints.down("sm"));

  return (
    <Popover
      open={Boolean(props.anchorEl)}
      anchorEl={isMobile ? undefined : props.anchorEl}
      anchorReference={isMobile ? "anchorPosition" : "anchorEl"}
      anchorPosition={
        isMobile
          ? { top: window.innerHeight - 100, left: window.innerWidth / 2 }
          : undefined
      }
      onClose={() => props.setAnchorEl(null)}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Box p={2}>
        {props.isSlotClosed(props.selectedSlots) ? (
          <Typography color="error">
            This slot is closed for booking.
          </Typography>
        ) : slotHasEvent(props.selectedSlots) ? (
          <Button variant="contained" onClick={handleViewDetails}>
            View
          </Button>
        ) : (
          <Button variant="contained" onClick={handleBook}>
            ADD ENTRY
          </Button>
        )}
      </Box>
    </Popover>
  );
}
