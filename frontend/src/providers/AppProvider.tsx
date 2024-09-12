"use client";

import { createContext, useState } from "react";
import { ColorModeContextProps } from "@/types/theme";
import { LayoutProps } from "@/types/layout-props";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import defaultTheme from "@/utils/theme/default";
import { useTranslation } from "react-i18next";

export const AppModeContext = createContext<ColorModeContextProps | null>(null);

export default function AppProvider({ children }: LayoutProps) {
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const { t } = useTranslation();

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === "dark" ? "light" : "dark"));
  };

  const theme = createTheme(defaultTheme(mode));
  const value = { mode, toggleColorMode, t };

  return (
    <AppModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppModeContext.Provider>
  );
}
