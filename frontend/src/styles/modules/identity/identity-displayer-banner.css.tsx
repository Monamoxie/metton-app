import { SxProps } from "@mui/material";
import { Theme } from "@mui/system";

export const Identity_Display_Banner_Css = (theme: Theme): SxProps<Theme> => ({
  justifyContent: "center",
  position: "relative",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.75)",
  ...(theme.palette.mode === "light" && {
    color: theme.palette.text.primary,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  }),
  p: 8,
  height: "30vh",
  width: "30vw",
  m: "auto",
  borderRadius: "10px",
  "& img": {
    bottom: 0,
    position: "relative",
    maxWidth: "600px",
    maxHeight: "700px",
  },
});

export const Identity_DisplayBannerCss: SxProps = {
  border: "1px solid green",
};
