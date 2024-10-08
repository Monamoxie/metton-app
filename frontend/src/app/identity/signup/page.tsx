"use client";

import * as React from "react";
import Stack from "@mui/material/Stack";
import SignUpCard from "@/components/identity/SignUpCard";
import { IDENTITY_DOUBLE_COLUMNS_CSS } from "@/styles/modules/identity/identity.css";
import Grid from "@mui/material/Grid2";
import IdentityDisplayBanner from "@/components/identity/IdentityDisplayBanner";
import { Backdrop } from "@mui/material";

export default function SignupPage() {
  return (
    <Stack direction="column" sx={IDENTITY_DOUBLE_COLUMNS_CSS}>
      <Grid container sx={{ height: "100dvh" }}>
        <Grid size={{ xs: 12, md: 7 }} className="identity-col-1">
          <Backdrop
            className="identity-sign-shared-backdrop"
            open={true}
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
          >
            <IdentityDisplayBanner />
          </Backdrop>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }} sx={{ padding: "12" }}>
          <SignUpCard />
        </Grid>
      </Grid>
    </Stack>
  );
}
