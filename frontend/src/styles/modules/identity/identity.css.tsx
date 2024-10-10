import { Theme } from "@mui/system";
import { SxProps } from "@mui/material";

export const IDENTITY_NAV_CSS = (theme: Theme): SxProps<Theme> => ({
  p: 4,
  pl: { xs: 4, sm: 4, lg: 10 },
  pr: { xs: 4, sm: 4, lg: 10 },
  justifyContent: "space-between",
  alignItems: "flex-start",
  width: "100%",
  height: "auto",
  zIndex: 10,
  position: "absolute",

  "& .identity-nav-logo-box img": {
    width: 125,
    height: 55,
  },
});

// ***************** IdentityRowWrapperCss ***************** //
export const IDENTITY_WRAPPER_CSS = (theme: Theme): SxProps<Theme> => ({
  alignItems: "stretch",
  position: "relative",
  width: "100%",
  height: { xs: "auto", md: "100dvh" },
  backgroundColor: theme.palette.background.default,
  backgroundSize: "cover",
});

// ***************** IDENTITY DOUBLE COLUMNS CSS ***************** //
export const IDENTITY_DOUBLE_COLUMNS_CSS = (theme: Theme): SxProps<Theme> => ({
  // gap: { xs: 6, sm: 12 },
  height: { xs: "100%", md: "100dvh" },
  zIndex: 0,

  "& .identity-col-1": {
    backgroundImage: "url('/images/bg/group.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    position: "relative",
    display: { xs: "None", sm: "block" },

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

// ***************** IDENTITY OVERLAY CSS ***************** //
export const IDENTITY_OVERLAY_CSS = (theme: Theme): SxProps<Theme> => ({
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

export const IDENTITY_FORM_CARD_CSS = (theme: Theme): SxProps<Theme> => ({
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
    [theme.breakpoints.up("sm")]: {
      padding: theme.spacing(4),
      width: "450px",
    },
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(4),
      width: "94%",
    },
    boxShadow:
      "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px, hsla(220, 30%, 5%, 0.05) 0px 0px 0px 1px",
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
