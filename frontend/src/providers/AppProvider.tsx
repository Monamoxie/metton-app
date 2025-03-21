"use client";

import {
  useState,
  useEffect,
} from "react";
import { LayoutProps } from "@/types/layout-props";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import defaultTheme from "@/utils/theme/default";
import { AppModeContext, PlatformSettingsContext } from "@/contexts/base";
import { PlatformSettingsContextProps } from "@/types/theme";
import { ColorMode } from "@/enums/core";
import axiosClient from "@/utils/axios-client";
import { getDefaultApiHeader } from "@/utils/utils";

export default function AppProvider({ children }: LayoutProps) {
  const { mode, toggleColorMode } = useColorMode();
  const { platformSettings } = usePlatformSettings();
  const theme = createTheme(defaultTheme(mode));

  return (
    <AppModeContext.Provider value={{ mode, toggleColorMode }}>
      <PlatformSettingsContext.Provider value={platformSettings}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </PlatformSettingsContext.Provider>
    </AppModeContext.Provider>
  );
}

/**
 * Manages theme mode and provides a toggle function.
 */
const useColorMode = () => {
  const [mode, setMode] = useState<ColorMode>(ColorMode.Dark);

  const toggleColorMode = () => {
    setMode((prevMode) =>
      prevMode === ColorMode.Dark ? ColorMode.Light : ColorMode.Dark
    );
  };

  return { mode, toggleColorMode };
};

/**
 * Loads platform settings from session storage or API.
 */
const loadPlatformSettings = async (
  setPlatformSettings: (settings: PlatformSettingsContextProps) => void
) => {
  const cachedConfig = sessionStorage.getItem("metton__platform_settings");

  if (cachedConfig) {
    setPlatformSettings(JSON.parse(cachedConfig));
    return;
  }

  try {
    const response = await axiosClient.get("/bash", {
      headers: getDefaultApiHeader(),
    });
    setPlatformSettings(response.data);
    sessionStorage.setItem(
      "metton_platform_settings",
      JSON.stringify(response.data)
    );
  } catch (error) {
    console.error("Failed to fetch platform settings:", error);
  }
};

/**
 * Manages platform settings state.
 */
const usePlatformSettings = () => {
  const [platformSettings, setPlatformSettings] =
    useState<PlatformSettingsContextProps>(undefined);

  useEffect(() => {
    loadPlatformSettings(setPlatformSettings);
  }, []);

  return { platformSettings };
};
