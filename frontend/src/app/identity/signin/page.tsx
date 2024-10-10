"use client";

import * as React from "react";
import Stack from "@mui/material/Stack";
import SignInCard from "@/components/identity/SignInCard";
import { IDENTITY_DOUBLE_COLUMNS_CSS } from "@/styles/modules/identity.css";
import Grid from "@mui/material/Grid2";
import IdentityDisplayBanner from "@/components/identity/IdentityDisplayBanner";
import { Backdrop } from "@mui/material";

export default function SignInPage() {
  return (
    <Stack direction="column" sx={IDENTITY_DOUBLE_COLUMNS_CSS}>
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
          <SignInCard />
        </Grid>
      </Grid>
    </Stack>
  );
}
