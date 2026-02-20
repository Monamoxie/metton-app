"use client";

import * as React from "react";
import Stack from "@mui/material/Stack";
import { IDENTITY_DOUBLE_COLUMNS_CSS } from "@/styles/modules/identity.css";
import Grid from "@mui/material/Grid";
import IdentityDisplayBanner from "@/components/identity/IdentityDisplayBanner";
import { Backdrop } from "@mui/material";
import ForgotPasswordCard from "@/components/identity/forgot-password/ForgotPasswordCard";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export default function ForgotPasswordPage() {
  const hasRecaptcha =
    process.env.NEXT_PUBLIC_HAS_GOOGLE_RECAPTCHA &&
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const reCaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

  return (
    <Stack direction="column" sx={IDENTITY_DOUBLE_COLUMNS_CSS}>
      <Grid container sx={{ height: "100dvh" }}>
        <Grid size={{ xs: 12, md: 7 }} className="identity-col-1">
          <Backdrop
            className="identity-sign-shared-backdrop"
            open={true}
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
          >
            <IdentityDisplayBanner message="Don't worry. It happens" />
          </Backdrop>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }} sx={{ padding: "12" }}>
          {hasRecaptcha ? (
            <GoogleReCaptchaProvider reCaptchaKey={reCaptchaKey}>
              <ForgotPasswordCard />
            </GoogleReCaptchaProvider>
          ) : (
            <ForgotPasswordCard />
          )}
        </Grid>
      </Grid>
    </Stack>
  );
}
