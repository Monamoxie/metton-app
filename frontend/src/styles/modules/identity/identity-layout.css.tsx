import { Theme } from "@mui/system";
import { SxProps } from "@mui/material";

// ***************** IdentityRowWrapperCss ***************** //
export const IDENTITY_WRAPPER_CSS = (theme: Theme): SxProps<Theme> => ({
  alignItems: "stretch",
  flexWrap: "wrap",
  position: "relative",
  width: "100%",
  height: { xs: "auto", md: "100dvh" },
  // position: { sm: "static", md: "fixed" },
  backgroundColor: theme.palette.background.default,
  backgroundSize: "cover",
});

// ***************** IDENTITY DOUBLE COLUMNS CSS ***************** //
export const IDENTITY_DOUBLE_COLUMNS_CSS = (theme: Theme): SxProps<Theme> => ({
  // gap: { xs: 6, sm: 12 },
  height: { xs: "100%", md: "100dvh" },
  zIndex: 0,

  "& .identity-sign-shared-grid": {
    backgroundImage: "url('/images/bg/group.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    position: "relative",

    "& .identity-sign-shared-backdrop": {
      position: "relative",
      height: "100%",
      ...(theme.palette.mode === "dark" && {
        backgroundColor: "rgba(0, 0, 0, 0.95)",
      }),
      ...(theme.palette.mode === "light" && {
        backgroundColor: "rgba(255, 255, 255, 0.85)",
      }),
    },
  },
});

export const Identity_Form_Card_Css = (theme: Theme): SxProps<Theme> => ({
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",

  "& .identity-form-card": {
    display: "flex",
    borderRadius: theme.spacing(2),
    flexDirection: "column",
    alignSelf: "center",
    gap: theme.spacing(4),
    padding: theme.spacing(2),
    // backgroundColor: theme.palette.background.paper,
    boxShadow:
      "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px, hsla(220, 30%, 5%, 0.05) 0px 0px 0px 1px",
    [theme.breakpoints.up("sm")]: {
      padding: theme.spacing(4),
      width: "450px",
    },
    ...theme.applyStyles("dark", {
      boxShadow:
        "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px, hsla(220, 30%, 5%, 0.05) 0px 0px 0px 1px",
    }),
  },

  "& .identity-form-card-title": {
    width: "100%",
    fontSize: "clamp(2rem, 10vw, 2.15rem)",
  },

  "& .card-content": {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    gap: 2,
  },

  "& .password-label-wrap": {
    display: "flex",
    justifyContent: "space-between",
  },
});
