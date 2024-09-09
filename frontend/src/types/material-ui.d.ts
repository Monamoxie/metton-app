import "@mui/material/Stack";
import { SxProps, Theme } from "@mui/system";

declare module "@mui/material/Stack" {
  interface StackOwnProps {
    sx?: SxProps<Theme> | ((theme: Theme) => SxProps<Theme>);
  }
}
