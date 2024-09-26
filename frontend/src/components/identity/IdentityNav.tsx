"use client";

import ToggleColorMode from "@/app/identity/signup/ToggleColorMode";
import { Box, Stack } from "@mui/material";
import { IDENTITY_NAV_CSS } from "@/styles/modules/identity/identity-nav.css";
import useColorMode from "@/hooks/use-color-mode";

export default function IdentityNav() {
  const logo = "/images/logo.png";

  const { mode, toggleColorMode } = useColorMode();

  return (
    <Stack direction="row" sx={IDENTITY_NAV_CSS}>
      <Box className="identity-nav-logo-box">
        <img src={logo} />
      </Box>
      <ToggleColorMode
        data-screenshot="toggle-mode"
        mode={mode}
        toggleColorMode={toggleColorMode}
      />
    </Stack>
  );
}
