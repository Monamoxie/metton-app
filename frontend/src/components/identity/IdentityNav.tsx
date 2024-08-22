import Button from "@mui/material/Button";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ToggleColorMode from "@/app/identity/signup/ToggleColorMode";
import { Box, Stack } from "@mui/material";

export default function IdentityNav({ mode, toggleColorMode }: any) {
  return (
    <Stack
      direction="row"
      sx={{
        p: 2,
        justifyContent: "space-between",
        alignItems: "flex-start",
        width: "100%",
      }}
    >
      <Button startIcon={<ArrowBackRoundedIcon />} component="a" href="#">
        Home
      </Button>
      <ToggleColorMode
        data-screenshot="toggle-mode"
        mode={mode}
        toggleColorMode={toggleColorMode}
      />
    </Stack>
  );
}
