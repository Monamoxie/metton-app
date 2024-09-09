"use client";

import ToggleColorMode from "@/app/identity/signup/ToggleColorMode";
import { Box, Stack } from "@mui/material";
import { Identity_Nav_Css } from "@/styles/modules/identity/identity-nav.css";
import useColorMode from "@/hooks/useColorMode";

export default function IdentityNav() {
  const logo = "/images/logo.png";

  const { mode, toggleColorMode } = useColorMode();

  return (
    <Stack direction="row" sx={Identity_Nav_Css}>
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
