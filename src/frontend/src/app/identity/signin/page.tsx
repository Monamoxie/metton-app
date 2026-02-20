"use client";

import * as React from "react";
import Stack from "@mui/material/Stack";
import SignInCard from "@/components/identity/signin/SignInCard";
import { IDENTITY_DOUBLE_COLUMNS_CSS } from "@/styles/modules/identity.css";
import Grid from "@mui/material/Grid";
import IdentityDisplayBanner from "@/components/identity/IdentityDisplayBanner";
import { Backdrop, useTheme } from "@mui/material";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export default function SignInPage() {
  return (
    <Stack direction="column" sx={IDENTITY_DOUBLE_COLUMNS_CSS(useTheme())}>
      <Grid container sx={{ height: "100dvh" }}>
        <Grid size={{ xs: 12, md: 7 }} className="identity-col-1">
          <Backdrop
            className="identity-sign-shared-backdrop"
            open={true}
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
          >
            <IdentityDisplayBanner message="Welcome Back." />
          </Backdrop>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }} sx={{ padding: "12" }}>
          {renderSignInCard()}
        </Grid>
      </Grid>
    </Stack>
  );
}

const renderSignInCard = () => {
  const hasRecaptcha =
    process.env.NEXT_PUBLIC_HAS_GOOGLE_RECAPTCHA &&
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (hasRecaptcha) {
    const reCaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string;

    return (
      <GoogleReCaptchaProvider reCaptchaKey={reCaptchaKey}>
        <SignInCard />
      </GoogleReCaptchaProvider>
    );
  }

  return <SignInCard />;
};
