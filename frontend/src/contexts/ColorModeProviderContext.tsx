"use client";

import { createContext, useState } from "react";
import { ColorModeContextProps } from "@/types/theme";
import { LayoutProps } from "@/types/layout-props";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import defaultTheme from "@/utils/theme/default";

export const ColorModeContext = createContext<ColorModeContextProps | null>(
  null
);

export default function ColorModeProviderContext({ children }: LayoutProps) {
  const [mode, setMode] = useState<"light" | "dark">("dark");

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === "dark" ? "light" : "dark"));
  };

  const theme = createTheme(defaultTheme(mode));
  const value = { mode, toggleColorMode };

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
