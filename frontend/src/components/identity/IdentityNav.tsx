import ToggleColorMode from "@/app/identity/signup/ToggleColorMode";
import { Box, Stack } from "@mui/material";
import { Identity_Nav_Css } from "@/styles/modules/identity/identity-nav.css";

export default function IdentityNav({ mode, toggleColorMode }: any) {
  const logo = "/images/logo.png";
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
