"use client";

import { LayoutProps } from "@/types/layout-props";
import Stack from "@mui/material/Stack";
import IdentityNav from "@/components/identity/IdentityNav";
import { IdentityWrapperCss } from "@/styles/modules/identity/identity-layout.css";

export default function IdentityLayout(props: LayoutProps) {
  return (
    <Stack direction="column" sx={IdentityWrapperCss}>
      <IdentityNav />
      {props.children}
    </Stack>
  );
}
