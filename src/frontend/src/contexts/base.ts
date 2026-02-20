import {
  ColorModeContextProps,
  PlatformSettingsContextProps,
} from "@/types/theme";
import { createContext, useState, useContext, useEffect } from "react";

export const AppModeContext = createContext<ColorModeContextProps | null>(null);

export const PlatformSettingsContext =
  createContext<PlatformSettingsContextProps>(undefined);
