import { Theme } from "@mui/system";
import { SxProps } from "@mui/material";

// ***************** IdentityRowWrapperCss ***************** //
export const IdentityWrapperCss = (theme: Theme): SxProps<Theme> => ({
  justifyContent: "space-between",
  border: "1px solid blue",
  width: "100%",
  height: { xs: "auto", md: "100dvh" },
  position: { sm: "static", md: "fixed" },
  backgroundColor: theme.palette.background.default,
  backgroundSize: "cover",
  // backgroundImage:
  //   "radial-gradient(ellipse at 70% 51%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
  ...(theme.palette.mode === "dark" && {
    backgroundImage:
      "radial-gradient(at 70% 51%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
  }),
});

// ***************** Identity SignUp SignIn Page Common Css ***************** //
export const IdentitySignUpSignInPageCommonCss: SxProps = {
  // gap: { xs: 6, sm: 12 },
  height: { xs: "100%", md: "100dvh" },
  // p: 2,
};
