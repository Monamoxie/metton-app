import { Theme } from "@mui/system";
import { SxProps } from "@mui/material";

export const IDENTITY_NAV_CSS = (theme: Theme): SxProps<Theme> => ({
  p: 4,
  pl: { xs: 4, sm: 4, lg: 10 },
  pr: { xs: 4, sm: 4, lg: 10 },
  justifyContent: "space-between",
  alignItems: "flex-start",
  // position: "absolute",
  width: "100%",
  height: "auto",
  // zIndex: 10,

  "& .identity-nav-logo-box > img": {
    width: 125,
    height: 55,
  },
});
