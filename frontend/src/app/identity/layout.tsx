"use client";

import { LayoutProps } from "@/interfaces/layout-props";
import Stack from "@mui/material/Stack";
import IdentityNav from "@/components/identity/IdentityNav";
import useColorMode from "@/hooks/useColorMode";
import { IdentityWrapperCss } from "@/styles/modules/identity/identity-layout.css";

export default function IdentityLayout(props: LayoutProps) {
  const { mode, toggleColorMode } = useColorMode();

  return (
    <div className="identity">
      <Stack direction="column" sx={IdentityWrapperCss}>
        <IdentityNav mode={mode} toggleColorMode={toggleColorMode} />
        {props.children}
      </Stack>
    </div>
  );
}
