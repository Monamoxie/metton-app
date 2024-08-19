import { Theme } from "@mui/system";
import { SxProps } from "@mui/material";

// ***************** IdentityRowWrapperCss ***************** //
export const IdentityRowWrapperCss: SxProps = {
  justifyContent: "space-between",
  width: "100%",
  p: { xs: 2, sm: 4 },
  position: { sm: "static", md: "fixed" },
};

// ***************** Identity Column Wrapper Css ***************** //
export const IdentityColumnWrapperCss = (theme: Theme): SxProps<Theme> => ({
  justifyContent: "space-between",
  backgroundImage:
    "radial-gradient(ellipse at 70% 51%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
  backgroundSize: "cover",
  height: { xs: "auto", md: "100dvh" },
  pb: { xs: 12, sm: 0 },
  ...(theme.palette.mode === "dark" && {
    backgroundImage:
      "radial-gradient(at 70% 51%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
  }),
});

// ***************** Identity SignUp SignIn Page Common Css ***************** //
export const IdentitySignUpSignInPageCommonCss: SxProps = {
  justifyContent: "center",
  gap: { xs: 6, sm: 12 },
  height: { xs: "100%", md: "100dvh" },
  p: 2,
};
