import { useContext } from "react";
import { ColorModeContext } from '@/contexts/ColorModeProviderContext';

export default function useColorMode() {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error("useColorMode must be used within a ColorModeProvider");
  }
  return context;
}
