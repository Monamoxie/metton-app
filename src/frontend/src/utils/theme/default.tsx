import { ThemeOptions, alpha } from "@mui/material/styles";
import { lightPalette, darkPalette } from "@/utils/theme/default/palette";
import { PaletteMode } from "@mui/material";
import { gray } from "@/utils/theme/default/color";

export default function defaultTheme(mode: PaletteMode): ThemeOptions {
  return {
    palette: {
      mode,
      ...(mode === "light" ? lightPalette : darkPalette),
    },
    transitions: {
      duration: {
        enteringScreen: 225,
        leavingScreen: 195,
      },
    },
  };
}
