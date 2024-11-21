import "@mui/material/Stack";
import "@mui/material/Container";
import { SxProps, Theme } from "@mui/system";
import "@mui/material/Box";
declare module "@mui/material/Stack" {
  interface StackOwnProps {
    sx?: SxProps<Theme> | ((theme: Theme) => SxProps<Theme>);
  }
}

declare module "@mui/material/Container" {
  interface ContainerOwnProps {
    sx?: SxProps<Theme> | ((theme: Theme) => SxProps<Theme>);
  }
}

declare module "@mui/material/Box" {
  interface BoxProps {
    sx?: SxProps<Theme> | ((theme: Theme) => SxProps<Theme>);
  }
}
