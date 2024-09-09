import { IconButtonProps } from "@mui/material/IconButton";

export interface ToggleCustomThemeProps {
  showCustomTheme: Boolean;
  toggleCustomTheme: () => void;
}

export interface ColorModeContextProps {
  mode: "light" | "dark";
  toggleColorMode: () => void;
}

export interface ToggleColorModeProps extends IconButtonProps {
  mode: PaletteMode;
  toggleColorMode: () => void;
}
