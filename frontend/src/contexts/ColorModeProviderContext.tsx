"use client";

import { createContext, useState } from "react";
import { ColorModeContextProps } from "@/interfaces/theme";
import { LayoutProps } from "@/interfaces/layout-props";
import { createTheme, ThemeProvider } from "@mui/material/styles";

export const ColorModeContext = createContext<ColorModeContextProps | null>(
  null
);

export default function ColorModeProviderContext({ children }: LayoutProps) {
  const [mode, setMode] = useState<"light" | "dark">("dark");

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === "dark" ? "light" : "dark"));
  };

  const defaultTheme = createTheme({ palette: { mode } });

  const value = {
    mode,
    toggleColorMode,
  };

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={defaultTheme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
}
