import "@mui/material/Stack";
import { SxProps, Theme } from "@mui/system";

declare module "@mui/material/Stack" {
  interface CustomStackOwnProps extends StackOwnProps {
    sx?: SxProps<Theme>;
  }
}
