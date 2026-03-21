import { ThemeOptions } from "@mui/material/styles";
import { lightPalette, darkPalette } from "@/utils/theme/default/palette";
import { PaletteMode } from "@mui/material";

export default function defaultTheme(mode: PaletteMode): ThemeOptions {
  const basePalette = mode === "light" ? lightPalette : darkPalette;

  const shadows: ThemeOptions["shadows"] = [
    "none",
    "var(--shadow-sm)",
    "var(--shadow-md)",
    "var(--shadow-lg)",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
  ];

  return {
    palette: {
      mode,
      ...basePalette,
    },
    shape: {
      borderRadius: 10,
    },
    spacing: 4,
    shadows,
    transitions: {
      duration: {
        enteringScreen: 225,
        leavingScreen: 195,
      },
    },
  };
}
