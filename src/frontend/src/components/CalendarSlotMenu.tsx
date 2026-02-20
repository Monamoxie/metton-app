import { Box, Button, Popover, Typography } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { SetStateProp } from "@/types/core";

interface CalendarSlotMenuProps {
  anchorEl: null | HTMLElement;
  setAnchorEl: SetStateProp<null | HTMLElement>;
  isClosed: boolean;
  hasEvent: boolean;
  handleBook: () => void;
  handleViewDetails: () => void;
}

export default function CalendarSlotMenu(props: CalendarSlotMenuProps) {
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
        <MenuActions
          isClosed={props.isClosed}
          hasEvent={props.hasEvent}
          handleBook={props.handleBook}
          handleViewDetails={props.handleViewDetails}
        />
      </Box>
    </Popover>
  );
}

const MenuActions = ({
  isClosed,
  hasEvent,
  handleBook,
  handleViewDetails,
}: Omit<CalendarSlotMenuProps, "anchorEl" | "setAnchorEl">) => {
  if (isClosed) {
    return (
      <Typography color="error">This slot is closed for booking.</Typography>
    );
  }

  if (hasEvent) {
    return (
      <Button variant="contained" onClick={handleViewDetails}>
        View
      </Button>
    );
  }

  return (
    <Button variant="contained" onClick={handleBook}>
      ADD ENTRY
    </Button>
  );
};
