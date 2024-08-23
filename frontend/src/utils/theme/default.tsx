import { createTheme, ThemeOptions } from "@mui/material/styles";
import { lightPalette, darkPalette } from "@/utils/theme/default/palette";
import { PaletteMode } from "@mui/material";

export default function defaultTheme(mode: PaletteMode): ThemeOptions {
  return {
    palette: {
      mode,
      ...(mode === "light" ? lightPalette : darkPalette),
    },
  };
}
