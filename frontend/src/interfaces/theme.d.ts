export interface ToggleCustomThemeProps {
  showCustomTheme: Boolean;
  toggleCustomTheme: () => void;
}

export interface ColorModeContextProps {
  mode: "light" | "dark";
  toggleColorMode: () => void;
}
