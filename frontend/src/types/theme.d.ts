import { IconButtonProps } from "@mui/material/IconButton";
import { string } from "zod";

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

export enum ColorMode {
  Light = "light",
  Dark = "dark",
}

export type PlatformSettingsContextProps =
  | Record<string, any>
  | null
  | undefined;