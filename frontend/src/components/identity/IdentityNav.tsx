import Button from "@mui/material/Button";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ToggleColorMode from "@/app/identity/signup/ToggleColorMode";

export default function IdentityNav({ mode, toggleColorMode }: any) {
  return (
    <>
      <Button startIcon={<ArrowBackRoundedIcon />} component="a" href="#">
        Home
      </Button>
      <ToggleColorMode
        data-screenshot="toggle-mode"
        mode={mode}
        toggleColorMode={toggleColorMode}
      />
    </>
  );
}
