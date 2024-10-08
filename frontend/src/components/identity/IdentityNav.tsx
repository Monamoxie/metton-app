"use client";

import ToggleColorMode from "@/app/identity/signup/ToggleColorMode";
import { Box, Link, Stack } from "@mui/material";
import { IDENTITY_NAV_CSS } from "@/styles/modules/identity/identity.css";
import useColorMode from "@/hooks/use-color-mode";

export default function IdentityNav() {
  const logo = "/images/logo.png";

  const { mode, toggleColorMode } = useColorMode();

  return (
    <Stack direction="row" sx={IDENTITY_NAV_CSS}>
      <Box className="identity-nav-logo-box">
        <Link href="/">
        <img src={logo} />
        </Link>
      </Box>
      <ToggleColorMode
        data-screenshot="toggle-mode"
        mode={mode}
        toggleColorMode={toggleColorMode}
      />
    </Stack>
  );
}
