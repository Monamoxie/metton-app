import { css } from "@emotion/react";
import { SxProps, Theme } from "@mui/system";

export const stackLayout = (theme: Theme) =>
  css({
    justifyContent: "space-between",
    border: "11px solid red",
    backgroundImage:
      "radial-gradient(ellipse at 70% 51%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundSize: "cover",
    [theme.breakpoints.up("xs")]: {
      height: "auto",
      paddingBottom: "12px",
    },
    [theme.breakpoints.up("sm")]: {
      paddingBottom: "0",
    },
    [theme.breakpoints.up("md")]: {
      height: "100dvh",
    },
    ...(theme.palette.mode === "dark" && {
      backgroundImage:
        "radial-gradient(at 70% 51%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  });
