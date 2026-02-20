"use client";

import { LayoutProps } from "@/types/layout-props";
import Stack from "@mui/material/Stack";
import IdentityNav from "@/components/identity/IdentityNav";
import { IDENTITY_WRAPPER_CSS } from "@/styles/modules/identity.css";

export default function IdentityLayout(props: LayoutProps) {
  return (
    <Stack sx={IDENTITY_WRAPPER_CSS}>
      <IdentityNav />
      {props.children}
    </Stack>
  );
}
