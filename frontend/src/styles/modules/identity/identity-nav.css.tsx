import { Theme } from "@mui/system";
import { SxProps } from "@mui/material";

export const Identity_Nav_Css = (theme: Theme): SxProps<Theme> => ({
  p: 4,
  pl: { xs: 4, sm: 4, lg: 10 },
  pr: { xs: 4, sm: 4, lg: 10 },
  justifyContent: "space-between",
  alignItems: "flex-start",
  position: "absolute",
  width: "100%",
  zIndex: 10,

  "& .identity-nav-logo-box > img": {
    width: 125,
    height: 55,
  },
});
