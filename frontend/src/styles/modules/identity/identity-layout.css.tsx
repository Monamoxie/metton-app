import { Theme } from "@mui/system";
import { SxProps } from "@mui/material";

// ***************** IdentityRowWrapperCss ***************** //
export const IdentityWrapperCss = (theme: Theme): SxProps<Theme> => ({
  justifyContent: "space-between",
  position: "relative",
  width: "100%",
  height: { xs: "auto", md: "100dvh" },
  // position: { sm: "static", md: "fixed" },
  backgroundColor: theme.palette.background.default,
  backgroundSize: "cover",
});

// ***************** Identity SignUp SignIn Page Common Css ***************** //
export const Identity_Sign_Shared_Css = (theme: Theme): SxProps<Theme> => ({
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
        backgroundColor: "rgba(0, 0, 0, 0.85)",
      }),
      ...(theme.palette.mode === "light" && {
        backgroundColor: "rgba(255, 255, 255, 0.85)",
      }),
    },
  },
});
